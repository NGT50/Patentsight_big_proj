// 생략: import ...
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [userInput, setUserInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [steps, setSteps] = useState(["format", "missing"]);
  const [showRejection, setShowRejection] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("PDF 파일을 선택해주세요.");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setIsUploading(true);
      const res = await axios.post("http://3.26.101.212:8000/analyze/", formData);
      const data = res.data;
      const claimSteps = data.claims_context_issues.map((_, idx) => `claim_${idx + 1}`);
      setSteps(["format", "missing", ...claimSteps]);
      setResult(data);
      setChatHistory([{ role: "bot", text: "문서 확인 시작! 먼저 형식 오류부터 알려줄게." }]);
      setStepIndex(0);
      setShowRejection(false);
    } catch (err) {
      alert("분석 실패: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (result && stepIndex >= 0) {
      const currentStep = steps[stepIndex];
      let message = "";

      if (currentStep === "format") {
        message = result.format_errors.length
          ? `형식 오류는 다음과 같습니다:\n- ${result.format_errors.join("\n- ")}`
          : "형식 오류는 없습니다!";
        message += "\n\n확인했으면 다음으로 넘어갈까?";
      } else if (currentStep === "missing") {
        message = result.missing_sections.length
          ? `필수 항목 누락: ${result.missing_sections.join(", ")}`
          : "모든 필수 항목이 포함되어 있습니다.";
        message += "\n\n청구항별 문맥 오류로 넘어갈게?";
      } else if (currentStep.startsWith("claim_")) {
        const idx = parseInt(currentStep.split("_")[1], 10) - 1;
        const claim = result.claims_context_issues[idx];
        message = `${claim.claim} 결과입니다:\n\n${claim.issue}`;
        if (idx + 1 < result.claims_context_issues.length) {
          message += "\n\n확인되면 다음 청구항으로 넘어갈게.";
        } else {
          message += "\n\n모든 리뷰를 마쳤어! 필요한 게 있으면 더 말해줘.";
          setShowRejection(true); // ✅ 마지막 리뷰 후
        }
      }

      setChatHistory((prev) => [...prev, { role: "bot", text: message }]);
    }
  }, [stepIndex, steps, result]);

  const handleUserSubmit = () => {
    if (!userInput.trim()) return;
    const next = userInput.toLowerCase();
    setChatHistory((prev) => [...prev, { role: "user", text: userInput }]);
    setUserInput("");
    if (next.includes("다음") || next.includes("넘어가") || next.includes("오키") || next.includes("확인")) {
      if (stepIndex + 1 < steps.length) {
        setStepIndex((prev) => prev + 1);
      }
    }
  };

  const handleDownloadTxt = () => {
    const content = chatHistory
      .map((msg) => `${msg.role === "bot" ? "🤖" : "🙋"} ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "특허문서_오류점검결과.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const content = chatHistory
      .map((msg) => `${msg.role === "bot" ? "🤖" : "🙋"} ${msg.text}`)
      .join("\n\n");

    const lines = doc.splitTextToSize(content, 180);
    doc.setFont("helvetica", "normal");
    doc.text(lines, 10, 20);
    doc.save("특허문서_오류점검결과.pdf");
  };

  return (
    <div className="container">
      <h1>🧠 특허 문서 분석 챗봇</h1>

      <div className="upload-box">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={isUploading}>
          {isUploading ? "분석 중..." : "PDF 업로드 및 분석"}
        </button>
      </div>

      <div className="chat-box">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={msg.role === "bot" ? "bot" : "user"}>
            <pre>{msg.text}</pre>
          </div>
        ))}
      </div>

      {result && (
        <>
          <div className="input-box">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button onClick={handleUserSubmit}>전송</button>
          </div>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button onClick={handleDownloadTxt} style={{ marginRight: "1rem" }}>📝 TXT 다운로드</button>
            <button onClick={handleDownloadPdf}>📄 PDF 다운로드</button>
          </div>

          {showRejection && (
            <div className="rejection-box">
              <h2>📄 거절 통지서 (예시)</h2>
              <p><strong>문서명:</strong> {selectedFile?.name}</p>
              <p><strong>거절 사유 요약:</strong></p>
              <ul>
                {result.format_errors.map((err, i) => <li key={`f-${i}`}>형식 오류: {err}</li>)}
                {result.missing_sections.map((sec, i) => <li key={`m-${i}`}>누락 항목: {sec}</li>)}
                {result.claims_context_issues.map((c, i) => (
                  <li key={`c-${i}`}>청구항 {i + 1}: {c.issue}</li>
                ))}
              </ul>
              <p>위와 같은 사유로 인해 본 출원은 현재 상태로는 특허 요건을 충족하지 못함을 알려드립니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
