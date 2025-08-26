import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitPatent,
  getPatentDetail,
  updateDocument,
  validatePatentDocument,
  generate3DModel,
} from '../api/patents';
import { uploadFile, getFileDetail, toAbsoluteFileUrl } from '../api/files';
import {
  FileText, Save, Send, Bot, Box, CheckCircle, AlertCircle,
  Plus, Trash2, Eye, Edit3, AlertTriangle, Image
} from 'lucide-react';

import GenerateDraftModal from '../pages/GenerateDraftModal';
import Button from '../components/Button';
import ThreeDModelViewer from '../components/ThreeDModelViewer';
import ChatPanel from '../components/ChatPanel';
import { initialDocumentState } from '../utils/documentState';

const mockPatentData = {
  title: "수술용 로봇 암의 회동 구조",
  technicalField: "본 발명은 일반적으로 의료 수술용 로봇 시스템에 관한 기술 분야에 속한다. 보다 구체적으로는, 인체 내 조직을 파지하거나 절단하는 과정에서 수술자가 정밀하고 안정적으로 시술을 수행할 수 있도록 돕는 회동 구조를 갖춘 수술용 로봇 암에 관한 것이다. 본 발명의 기술은 특히 복잡한 기계적 구성에 따른 고장 가능성과 조작 직관성의 저하라는 종래 수술용 로봇 암의 한계를 극복하고, 단순하면서도 정밀한 회동 메커니즘을 제공함으로써 수술 환경의 안전성과 효율성을 향상시키는 것을 그 기술적 특징으로 한다.",
  backgroundTechnology: "최근 최소 침습 수술(minimally invasive surgery) 및 원격 수술(remote surgery)의 확산에 따라, 정밀한 기구 조작이 가능한 수술용 로봇 암이 다양한 의료 환경에서 활용되고 있다. 그러나 종래의 수술용 로봇 암은 다음과 같은 한계를 지닌다.\n첫째, 구조적 복잡성이다. 종래의 수술용 로봇 암은 복수의 모터, 기어, 링크 장치 등이 중첩된 구조를 채택하고 있어, 조작 및 구동 과정에서의 부품 마모, 오작동 가능성이 높다. 이는 수술의 안정성에 심각한 영향을 미친다.\n둘째, 조작 직관성 부족이다. 종래 구조에서는 다수의 모터가 각각 독립적으로 구동되어야 하므로, 수술자가 원하는 기울기나 회동 동작을 직관적으로 구현하기 어렵다. 이로 인해 숙련된 사용자라도 조작 과정에서 시간 지연이 발생할 수 있다.\n셋째, 유지보수와 경제성 저하이다. 다수의 기계적 연결 요소는 시스템의 무게를 증가시키고, 유지보수 비용을 상승시키는 요인으로 작용한다. 또한, 복잡한 구조는 수술 현장에서의 신뢰성을 떨어뜨리고, 의료 서비스 품질 전반에도 부정적인 영향을 준다.\n따라서 기존 기술은 의료 수술에서 요구되는 높은 신뢰성, 직관성, 그리고 비용 효율성을 충분히 충족하지 못하는 문제를 안고 있다.",
  inventionDetails: {
    problemToSolve: "본 발명은 종래 기술의 문제점을 극복하기 위하여 고안된 것으로, 구체적으로 다음과 같은 과제를 해결하는 것을 목적으로 한다.\n\n종래 기술의 복잡한 기계적 요소에 기인한 고장 가능성을 줄이고,\n수술자가 보다 직관적으로 조작할 수 있는 단순화된 회동 구조를 제공하며,\n수술 과정에서 요구되는 정밀한 제어 성능을 확보함으로써, 수술의 안전성과 효율성을 동시에 향상시키고자 한다.\n또한, 본 발명은 기계적 구조의 단순화와 와이어 기반의 회동 제어 메커니즘을 채택하여, 장치의 내구성을 강화하고 유지보수 비용을 절감할 수 있는 효과를 달성하고자 한다.",
    solution: "상기 과제를 해결하기 위하여 본 발명은 다음과 같은 구성을 채택한다.\n\n시술용 그립퍼와 지지 디스크\n본 발명에 따른 수술용 로봇 암은 시술용 그립퍼를 포함하며, 상기 그립퍼는 하단에서 그립퍼 지지 디스크와 연결된다.\n지지 디스크는 중심바를 매개로 하부 구조와 결합되며, 중심바와 지지 디스크 사이에는 **볼 조인트(ball joint)**가 형성되어 있어, 디스크가 X축 및 Y축 방향으로 자유롭게 회동할 수 있다.\n\n와이어 구동 메커니즘\n지지 디스크의 중심점을 기준으로 대칭적인 위치에 3개의 연결 지점이 형성된다.\n각 지점에는 디스크 와이어가 연결되며, 이 와이어는 하단으로 연장되어 모터 구동부와 연결된다.\n모터 구동부는 와이어를 상하 방향으로 구동함으로써 지지 디스크의 기울기 및 회동 각도를 정밀하게 제어할 수 있다.\n\n구조 단순화\n본 발명의 수술용 로봇 암은 하나의 중심점을 기준으로 한 2축 회동 구조를 채택하여, 불필요한 기계적 연결 요소를 최소화한다.\n이로써 고장률이 낮아지고 유지보수가 용이해지며, 의료 현장에서의 활용성이 높아진다.",
    effect: "본 발명은 상기한 구성을 통하여 다음과 같은 효과를 제공한다.\n\n정밀 제어 효과\n와이어 구동 방식을 적용함으로써 미세한 각도 조절이 가능하여, 실제 수술 시 조직을 섬세하게 파지하거나 정확한 위치에서 절단할 수 있다.\n\n구조적 단순성 확보\n다수의 모터 및 기어 장치가 요구되는 종래 기술과 달리, 단순화된 볼 조인트 및 와이어 구조를 적용함으로써 기계적 고장 가능성을 현저히 줄일 수 있다.\n\n조작 편의성 향상\n수술자가 직관적으로 조작할 수 있으며, 숙련도에 관계없이 안정적인 제어가 가능하다.\n\n효율성 증대\n본 발명은 종래 구조에 비해 약 30% 이상의 정밀성과 안정성 향상을 가능하게 하여, 수술의 안전성과 성공률을 높인다.\n\n경제성 및 내구성 강화\n불필요한 기계 요소 제거로 유지보수 비용이 절감되며, 장치의 내구성 또한 강화된다."
  },
  claims: [
    "수술용 로봇 암은 시술용 그립퍼와 이를 지지 및 회동시키는 메커니즘을 포함하며, 상기 그립퍼는 하단에서 고정 지지되는 그립퍼 지지 디스크와 상기 지지 디스크의 중심 하단부에 연결된 중심바를 포함하는 것을 특징으로 하는 수술용 로봇 암의 회동 구조.",
    "제1항에 있어서, 상기 중심바와 지지 디스크는 볼 조인트에 의해 연결되어, 지지 디스크가 X축 및 Y축 방향으로 자유롭게 회동될 수 있도록 구성된 수술용 로봇 암의 회동 구조.",
    "제2항에 있어서, 상기 지지 디스크의 중심점을 기준으로 대칭 위치에 배치된 3지점의 둘레면에는 디스크 와이어가 연결되며, 이 디스크 와이어는 각각 하단으로 연장되어 별도의 모터 구동부와 연결된 수술용 로봇 암의 회동 구조.",
    "제3항에 있어서, 상기 모터 구동부는 상기 와이어를 상하 방향으로 구동함으로써 지지 디스크의 기울기 및 회동 각도를 정밀하게 제어할 수 있도록 구성된 수술용 로봇 암의 회동 구조.",
    "제4항에 있어서, 상기 시술용 그립퍼는 수술 부위의 조직을 파지하거나 절단하는 기능을 수행하기 위한 구조로 형성된 수술용 로봇 암의 회동 구조.",
    "제1항에 있어서, 상기 로봇 암은 하나의 중심점을 기준으로 2축 회동이 이루어지는 구조를 채택하여 복잡한 기계적 요소를 줄여 고장 가능성을 낮출 수 있도록 구성된 수술용 로봇 암의 회동 구조.",
    "제6항에 있어서, 상기 로봇 암은 시술자가 직관적으로 조작할 수 있도록 설계되어, 유지보수가 간편하게 이루어질 수 있도록 구성된 수술용 로봇 암의 회동 구조.",
    "제7항에 있어서, 상기 와이어 구동 방식은 미세한 제어를 가능하게 하여 실제 수술 시 조직을 섬세하게 파지하거나 원하는 위치에서 정확하게 절단할 수 있도록 구성된 수술용 로봇 암의 회동 구조.",
    "제8항에 있어서, 상기 수술용 로봇 암은 정밀한 수술 환경에서 안정적이고 효율적인 조작을 가능하게 하며, 장치의 내구성과 경제성 면에서도 우수한 성능을 발휘하도록 구성된 수술용 로봇 암의 회동 구조."
  ],
  summary: "본 발명은 수술용 로봇 암의 회동 구조에 관한 것이다. 본 발명의 로봇 암은 시술용 그립퍼와, 이를 지지 및 회동시키는 지지 디스크 및 중심바를 포함한다. 상기 지지 디스크는 볼 조인트에 의해 X축 및 Y축 방향으로 자유롭게 회동할 수 있도록 구성되며, 지지 디스크의 대칭 위치에 연결된 3개의 디스크 와이어는 각각 모터 구동부와 연결된다. 모터 구동부는 와이어를 상하 방향으로 구동하여 지지 디스크의 기울기 및 회동 각도를 정밀하게 제어한다. 이로써 본 발명은 구조적 단순성과 안정성을 확보함과 동시에, 수술자가 직관적으로 조직을 섬세하게 파지하거나 정확하게 절단할 수 있도록 하여 수술의 안전성과 효율성을 향상시킨다.",
  drawingDescription: "도 1: 본 발명에 따른 수술용 로봇 암의 전체 구성도\n도 2: 지지 디스크와 중심바의 볼 조인트 결합 구조 단면도\n도 3: 지지 디스크의 둘레면에 배치된 3개의 와이어 및 모터 구동부와의 연결 관계 사시도\n도 4: 와이어 구동에 의한 지지 디스크의 기울기 및 회동 동작 예시도\n도 5: 본 발명의 로봇 암이 실제 수술 상황에서 조직을 파지하거나 절단하는 작동 예시도"
};

const DocumentEditor = () => {
  const { id: patentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const fieldRefs = useRef({});

  const [document, setDocument] = useState(initialDocumentState);
  const [activeTab, setActiveTab] = useState('details');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  const [drawingFiles, setDrawingFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [attachedPdf, setAttachedPdf] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  
  const hasPreloadedData = !!location.state?.parsedData;
  const mockChatResponses = {
    background: {
      content: `네 현재 내용을 바탕으로 아래와 같이 수정하였습니다.\n\n최근 의료 분야에서는 최소 침습 수술(minimally invasive surgery) 및 원격 수술(remote surgery)이 빠르게 확산되고 있으며, 이와 같은 수술은 기존의 개복 수술 대비 환자의 회복 기간을 단축시키고, 수술 후 합병증의 발생 가능성을 줄이며, 환자의 전반적인 삶의 질을 향상시키는 장점이 있다. 이러한 수술 방법에서는 수술자가 직접 기구를 조작하기보다는, 정밀한 동작을 수행할 수 있는 수술용 로봇 암이 필수적으로 사용되고 있다.\n그러나 종래의 수술용 로봇 암은 다음과 같은 기술적 한계를 지니고 있어, 실제 임상 현장에서 여러 문제를 발생시키고 있다.\n첫째, 구조적 복잡성에 따른 문제이다. 기존 수술용 로봇 암은 회동 및 기울기 동작을 구현하기 위하여 다수의 모터, 기어, 링크 장치 등을 다단계로 연결하는 복잡한 구조를 채택하고 있다. 이와 같은 구조는 구동 과정에서 각 부품 간 마찰 및 응력 집중이 빈번히 발생하여 부품의 마모와 손상을 가속화시킨다. 이로 인해 시스템은 잦은 고장을 유발하고, 수술 도중 예기치 못한 기계적 오류가 발생할 위험이 높다. 이는 곧 수술의 안전성 저하로 이어지며, 환자의 생명과 직결되는 중대한 문제를 야기할 수 있다.\n둘째, 조작의 직관성 부족이다. 종래의 구조에서는 개별 모터가 각각 독립적으로 구동되어야 하므로, 사용자가 원하는 방향으로 로봇 암을 기울이거나 회전시키기 위해서는 다수의 모터를 동시에 조작하거나 복잡한 제어 알고리즘에 의존해야 한다. 이는 수술자가 즉각적으로 원하는 동작을 구현하는 데 어려움을 초래하며, 실시간 대응력이 저하된다. 특히, 종양 절제나 혈관 봉합과 같은 고난도의 수술에서는 미세한 조직 제어가 요구되는데, 기존 시스템의 조작 직관성 부족은 숙련된 의료인조차 동작 지연과 부정확한 기구 제어를 경험하게 한다.\n셋째, 유지보수 및 경제성 저하이다. 다수의 기계적 연결 요소는 전체 시스템의 무게를 증가시켜 설치 공간의 제약을 가중시키며, 기계적 마모에 따른 부품 교체 주기를 단축시킨다. 또한, 복잡한 기계 구조로 인해 시스템 유지보수 과정에서 시간과 비용이 과도하게 소요된다. 이는 병원 차원에서의 운영 비용 증가를 초래하며, 의료 서비스 전반의 효율성에도 부정적인 영향을 미친다. 나아가 이러한 구조적 복잡성은 장치의 신뢰성을 저하시켜, 환자와 의료진 모두에게 불필요한 부담을 가중시키는 요인이 된다.\n결과적으로, 종래의 수술용 로봇 암은 의료 수술에서 요구되는 높은 신뢰성, 직관적 조작성, 비용 효율성을 충족하지 못하는 문제점을 안고 있다. 따라서 보다 단순한 구조를 가지면서도 정밀한 제어가 가능한 새로운 형태의 수술용 로봇 암 구조가 요구되고 있다.`,
      action: { type: 'UPDATE_FIELD', payload: { fieldName: 'backgroundTechnology', value: `최근 의료 분야에서는 최소 침습 수술(minimally invasive surgery) 및 원격 수술(remote surgery)이 빠르게 확산되고 있으며, 이와 같은 수술은 기존의 개복 수술 대비 환자의 회복 기간을 단축시키고, 수술 후 합병증의 발생 가능성을 줄이며, 환자의 전반적인 삶의 질을 향상시키는 장점이 있다. 이러한 수술 방법에서는 수술자가 직접 기구를 조작하기보다는, 정밀한 동작을 수행할 수 있는 수술용 로봇 암이 필수적으로 사용되고 있다.\n그러나 종래의 수술용 로봇 암은 다음과 같은 기술적 한계를 지니고 있어, 실제 임상 현장에서 여러 문제를 발생시키고 있다.\n첫째, 구조적 복잡성에 따른 문제이다. 기존 수술용 로봇 암은 회동 및 기울기 동작을 구현하기 위하여 다수의 모터, 기어, 링크 장치 등을 다단계로 연결하는 복잡한 구조를 채택하고 있다. 이와 같은 구조는 구동 과정에서 각 부품 간 마찰 및 응력 집중이 빈번히 발생하여 부품의 마모와 손상을 가속화시킨다. 이로 인해 시스템은 잦은 고장을 유발하고, 수술 도중 예기치 못한 기계적 오류가 발생할 위험이 높다. 이는 곧 수술의 안전성 저하로 이어지며, 환자의 생명과 직결되는 중대한 문제를 야기할 수 있다.\n둘째, 조작의 직관성 부족이다. 종래의 구조에서는 개별 모터가 각각 독립적으로 구동되어야 하므로, 사용자가 원하는 방향으로 로봇 암을 기울이거나 회전시키기 위해서는 다수의 모터를 동시에 조작하거나 복잡한 제어 알고리즘에 의존해야 한다. 이는 수술자가 즉각적으로 원하는 동작을 구현하는 데 어려움을 초래하며, 실시간 대응력이 저하된다. 특히, 종양 절제나 혈관 봉합과 같은 고난도의 수술에서는 미세한 조직 제어가 요구되는데, 기존 시스템의 조작 직관성 부족은 숙련된 의료인조차 동작 지연과 부정확한 기구 제어를 경험하게 한다.\n셋째, 유지보수 및 경제성 저하이다. 다수의 기계적 연결 요소는 전체 시스템의 무게를 증가시켜 설치 공간의 제약을 가중시키며, 기계적 마모에 따른 부품 교체 주기를 단축시킨다. 또한, 복잡한 기계 구조로 인해 시스템 유지보수 과정에서 시간과 비용이 과도하게 소요된다. 이는 병원 차원에서의 운영 비용 증가를 초래하며, 의료 서비스 전반의 효율성에도 부정적인 영향을 미친다. 나아가 이러한 구조적 복잡성은 장치의 신뢰성을 저하시켜, 환자와 의료진 모두에게 불필요한 부담을 가중시키는 요인이 된다.\n결과적으로, 종래의 수술용 로봇 암은 의료 수술에서 요구되는 높은 신뢰성, 직관적 조작성, 비용 효율성을 충족하지 못하는 문제점을 안고 있다. 따라서 보다 단순한 구조를 가지면서도 정밀한 제어가 가능한 새로운 형태의 수술용 로봇 암 구조가 요구되고 있다.` } }
    },
    claimsReview: {
      messageType: 'CLAIMS_REVIEW',
      header: '네 청구항을 검토한 결과 다음과 같은 수정사항을 제안합니다.',
      reviews: [
        { claimNumber: 1, problem: '큰 오류는 없음. 다만 "고정 지지되는"이라는 표현이 모순적일 수 있음 → 뒤에서 "회동" 기능을 명시하면서 “고정 지지”라고 표현하면 심사관이 혼동할 수 있음.', suggestion: '수술용 로봇 암은 시술용 그립퍼와 이를 지지 및 회동시키는 메커니즘을 포함하며, 상기 그립퍼는 하단에서 지지 디스크와 연결되고, 상기 지지 디스크의 중심 하단부에는 중심바가 연결된 것을 특징으로 하는 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 0, value: '수술용 로봇 암은 시술용 그립퍼와 이를 지지 및 회동시키는 메커니즘을 포함하며, 상기 그립퍼는 하단에서 지지 디스크와 연결되고, 상기 지지 디스크의 중심 하단부에는 중심바가 연결된 것을 특징으로 하는 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 2, problem: '논리적 오류 없음.\n다만 "자유롭게 회동"이라는 표현은 너무 광범위하여 “기술적 범위 불명확성” 지적 가능.', suggestion: '제1항에 있어서, 상기 중심바와 지지 디스크는 볼 조인트에 의해 연결되어, 상기 지지 디스크가 중심바를 기준으로 X축 및 Y축 방향으로 기울어지며 회동될 수 있도록 구성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 1, value: '제1항에 있어서, 상기 중심바와 지지 디스크는 볼 조인트에 의해 연결되어, 상기 지지 디스크가 중심바를 기준으로 X축 및 Y축 방향으로 기울어지며 회동될 수 있도록 구성된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 3, problem: '“대칭 위치에 배치된 3지점” → 불명확. (120도 간격인지, 단순 좌우 대칭인지 모호)\n“별도의 모터 구동부” → 모터가 하나인지, 복수인지 불명확.', suggestion: '제2항에 있어서, 상기 지지 디스크의 중심점을 기준으로 약 120도 간격으로 배치된 3개의 둘레 지점에는 디스크 와이어가 각각 연결되며, 상기 디스크 와이어는 하단으로 연장되어 서로 독립적인 모터 구동부와 연결된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 2, value: '제2항에 있어서, 상기 지지 디스크의 중심점을 기준으로 약 120도 간격으로 배치된 3개의 둘레 지점에는 디스크 와이어가 각각 연결되며, 상기 디스크 와이어는 하단으로 연장되어 서로 독립적인 모터 구동부와 연결된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 4, problem: '“상하 방향”만으로는 기울기/회동 제어 원리가 불명확할 수 있음. (좌우/전후 제어는 와이어의 상대적 길이 변화에 의해 구현되므로 보완 필요)', suggestion: '제3항에 있어서, 상기 모터 구동부는 상기 와이어를 독립적으로 상하 방향으로 이동시켜, 상기 지지 디스크의 기울기 및 회동 각도를 정밀하게 제어할 수 있도록 구성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 3, value: '제3항에 있어서, 상기 모터 구동부는 상기 와이어를 독립적으로 상하 방향으로 이동시켜, 상기 지지 디스크의 기울기 및 회동 각도를 정밀하게 제어할 수 있도록 구성된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 5, problem: '오류 없음. 다만 “파지하거나 절단하는 기능”이 포괄적이라 특허청에서 “구체적 수단 불비”로 지적될 수 있음.', suggestion: '제4항에 있어서, 상기 시술용 그립퍼는 수술 부위의 조직을 안정적으로 파지하거나, 선택적으로 절단할 수 있도록 집게부 및 절단부를 포함하여 형성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 4, value: '제4항에 있어서, 상기 시술용 그립퍼는 수술 부위의 조직을 안정적으로 파지하거나, 선택적으로 절단할 수 있도록 집게부 및 절단부를 포함하여 형성된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 6, problem: '“2축 회동”이라는 표현은 모호 (X축·Y축임을 명확히 하는 것이 바람직).', suggestion: '제1항에 있어서, 상기 로봇 암은 하나의 중심점을 기준으로 X축 및 Y축 방향의 2축 회동이 이루어지는 구조를 채택하여 복잡한 기계적 요소를 줄여 고장 가능성을 낮출 수 있도록 구성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 5, value: '제1항에 있어서, 상기 로봇 암은 하나의 중심점을 기준으로 X축 및 Y축 방향의 2축 회동이 이루어지는 구조를 채택하여 복잡한 기계적 요소를 줄여 고장 가능성을 낮출 수 있도록 구성된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 7, problem: '"직관적으로 조작"은 주관적 표현 → 기술적 범위 불명확.\n"유지보수"도 모호. (구체적 기술 요소 필요)', suggestion: '제6항에 있어서, 상기 로봇 암은 불필요한 기계적 연결 요소를 최소화한 구조를 채택하여, 시술자가 별도의 복잡한 조작 없이 회동을 제어할 수 있고, 부품 교체 및 유지보수가 간편하게 이루어질 수 있도록 구성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 6, value: '제6항에 있어서, 상기 로봇 암은 불필요한 기계적 연결 요소를 최소화한 구조를 채택하여, 시술자가 별도의 복잡한 조작 없이 회동을 제어할 수 있고, 부품 교체 및 유지보수가 간편하게 이루어질 수 있도록 구성된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 8, problem: '오류 없음. 다만 "미세한 제어" → 불명확.', suggestion: '제7항에 있어서, 상기 와이어 구동 방식은 각 와이어의 길이를 미세 단위로 독립적으로 조절할 수 있도록 하여, 실제 수술 시 조직을 섬세하게 파지하거나 원하는 위치에서 정확하게 절단할 수 있도록 구성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 7, value: '제7항에 있어서, 상기 와이어 구동 방식은 각 와이어의 길이를 미세 단위로 독립적으로 조절할 수 있도록 하여, 실제 수술 시 조직을 섬세하게 파지하거나 원하는 위치에서 정확하게 절단할 수 있도록 구성된 수술용 로봇 암의 회동 구조.' } } },
        { claimNumber: 9, problem: '“안정적이고 효율적인 조작” / “우수한 성능” → 주관적 표현, 심사 시 보정 지시 가능.', suggestion: '제8항에 있어서, 상기 수술용 로봇 암은 와이어 구동 메커니즘과 단순화된 2축 회동 구조를 통해 정밀한 수술 환경에서 안정적인 기구 제어와 효율적인 동작을 가능하게 하며, 부품 수 감소로 인한 내구성 향상 및 유지보수 비용 절감 효과를 제공하도록 구성된 수술용 로봇 암의 회동 구조.', action: { type: 'UPDATE_CLAIM', payload: { index: 8, value: '제8항에 있어서, 상기 수술용 로봇 암은 와이어 구동 메커니즘과 단순화된 2축 회동 구조를 통해 정밀한 수술 환경에서 안정적인 기구 제어와 효율적인 동작을 가능하게 하며, 부품 수 감소로 인한 내구성 향상 및 유지보수 비용 절감 효과를 제공하도록 구성된 수술용 로봇 암의 회동 구조.' } } },
      ],
    }
  };

  const selectedImageIndex = drawingFiles.findIndex(
    (f) => f.fileId === selectedDrawingId,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patentDetail', patentId],
    queryFn: () => getPatentDetail(patentId),
    enabled: !hasPreloadedData && !!patentId && patentId !== 'new-from-pdf',
  });

  const saveMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      queryClient.invalidateQueries({ queryKey: ['patentDetail', patentId] });
      alert('임시저장이 완료되었습니다.');
    },
    onError: (error) => alert('저장 중 오류가 발생했습니다: ' + error.message),
  });

  const submitMutation = useMutation({
    mutationFn: async ({ patentId, documentData }) => {
      await updateDocument({ patentId, documentData });
      return await submitPatent(patentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPatents'] });
      alert('출원서가 최종 제출되었습니다. 마이페이지로 이동합니다.');
      navigate('/mypage');
    },
    onError: (error) => alert('최종 제출 중 오류가 발생했습니다: ' + error.message),
  });

  const generateDraftMutation = useMutation({
    mutationFn: () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(mockPatentData);
        }, 1500);
      });
    },
    onSuccess: (generatedData) => {
      setDocument(prev => ({ ...prev, ...generatedData }));
      setIsGeneratorOpen(false);
      alert('AI 초안 생성이 완료되었습니다.');
    },
    onError: (err) => alert(`초안 생성 중 오류가 발생했습니다: ${err.message}`),
  });
  
  const startChatMutation = useMutation({
    mutationFn: async () => { return { sessionId: 'mock-session-id' }; },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages([{ sender: 'ai', content: '출원서류 점검을 위한 어시스턴스 입니다. 무엇을 도와드릴까요?' }]);
    },
    onError: (error) => {
      setMessages([{ sender: 'ai', content: `AI 어시스턴트 연결에 실패했습니다.` }]);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }) => {
      return new Promise(resolve => {
        let delay = 2000;
        let response;

        if (content.includes('배경기술')) {
          response = { sender: 'ai', ...mockChatResponses.background };
        } else if (content.includes('청구항 전체')) {
          delay = 7000;
          response = { sender: 'ai', ...mockChatResponses.claimsReview };
        } else {
          response = { sender: 'ai', content: '죄송합니다. 요청하신 내용을 이해하지 못했습니다. "배경기술" 또는 "청구항 전체"에 대해 질문해주세요.' };
        }
        
        setTimeout(() => resolve(response), delay);
      });
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data]);
    },
    onError: (error) => {
      setMessages(prev => [...prev, { sender: 'ai', content: `오류가 발생했습니다.` }]);
    },
    onSettled: () => {
      setIsAiTyping(false);
    }
  });

  const aiCheckMutation = useMutation({
    mutationFn: validatePatentDocument,
    onSuccess: (results) => {
      setAiResults(results);
      alert('AI 서류 검토가 완료되었습니다.');
    },
    onError: (error) => alert(`AI 서류 검토 중 오류가 발생했습니다: ${error.message}`),
  });

  useEffect(() => {
    const preloadedData = location.state?.parsedData;
    const originalFile = location.state?.originalFile;
    if (originalFile) setAttachedPdf(originalFile);

    if (preloadedData) {
      setDocument({ ...initialDocumentState, ...preloadedData });
    } 
    else if (data) {
      const doc = data;
      setDocument({
        ...initialDocumentState,
        title: doc.title || "",
        technicalField: doc.technicalField || "",
        backgroundTechnology: doc.backgroundTechnology || "",
        inventionDetails: {
          problemToSolve: doc.inventionDetails?.problemToSolve || "",
          solution: doc.inventionDetails?.solution || "",
          effect: doc.inventionDetails?.effect || "",
        },
        summary: doc.summary || "",
        drawingDescription: doc.drawingDescription || "",
        claims: doc.claims && doc.claims.length > 0 ? doc.claims : [''],
      });
    }
  }, [data, location.state]);

  useEffect(() => {
    if (data?.attachmentIds?.length) {
      (async () => {
        try {
          const metas = await Promise.all(
            data.attachmentIds.map((id) => getFileDetail(id))
          );
          const images = metas
            .filter((m) => m.fileType === 'IMAGE')
            .map(({ fileId, fileUrl, fileName }) => ({ fileId, fileUrl, fileName }));
          setDrawingFiles(images);
          if (images.length > 0) {
            setSelectedDrawingId(images[0].fileId);
          }
          const glbMeta = metas.find((m) => m.fileType === 'GLB');
          setModelFile(
            glbMeta ? {
              fileId: glbMeta.fileId,
              fileUrl: toAbsoluteFileUrl(`/api/files/${glbMeta.fileId}/content`),
              fileName: glbMeta.fileName,
            } : null
          );
        } catch (err) {
          console.error('첨부 파일 로딩 실패:', err);
        }
      })();
    } else {
      setDrawingFiles([]);
      setModelFile(null);
    }
  }, [data]);

  useEffect(() => {
    if (patentId && patentId !== 'new-from-pdf') {
      setMessages([]);
      startChatMutation.mutate(patentId);
    }
  }, [patentId]);

  const handleInputChange = (e) => setDocument(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNestedInputChange = (e) => setDocument(prev => ({ ...prev, inventionDetails: { ...prev.inventionDetails, [e.target.name]: e.target.value } }));
  const handleClaimChange = (index, value) => {
    const newClaims = [...document.claims];
    newClaims[index] = value;
    setDocument(prev => ({ ...prev, claims: newClaims }));
  };

  const addClaim = () => setDocument(prev => ({ ...prev, claims: [...prev.claims, ''] }));
  const removeClaim = (index) => {
    if (document.claims.length > 1) {
      setDocument(prev => ({ ...prev, claims: prev.claims.filter((_, i) => i !== index) }));
    }
  };

  const handleDrawingUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await Promise.all(
        files.map(file => uploadFile({ file, patentId }))
      );
      setDrawingFiles(prev => [...prev, ...uploaded]);
      if (!selectedDrawingId && uploaded.length > 0) {
        setSelectedDrawingId(uploaded[0].fileId);
      }
    } catch (error) {
      console.error('도면 업로드 실패:', error);
      setUploadError('도면 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  
  const handleSaveDraft = () => saveMutation.mutate({ patentId, documentData: document });
  const handleSubmit = () => {
    if (window.confirm('정말로 최종 제출하시겠습니까? 제출 후에는 수정이 어렵습니다.')) {
      submitMutation.mutate({ patentId, documentData: document });
    }
  };

  const handleGenerateDraft = () => {
    generateDraftMutation.mutate();
  };
  
  const handleGenerate3D = async () => {
    const target = drawingFiles.find((f) => f.fileId === selectedDrawingId);
    if (!target) {
      return alert('3D로 변환할 도면을 선택해주세요.');
    }
    try {
      const { fileId } = await generate3DModel({ patentId, imageId: target.fileId });
      setModelFile({ fileId, fileUrl: toAbsoluteFileUrl(`/api/files/${fileId}/content`), fileName: 'model.glb' });
      alert('3D 도면 생성이 완료되었습니다.');
    } catch (err) {
      console.error('3D 변환 실패:', err);
      alert('3D 변환 중 오류가 발생했습니다.');
    }
  };

  const handleAiCheck = () => {
    if (patentId) {
      aiCheckMutation.mutate(patentId);
    } else {
      alert("문서를 먼저 저장해주세요.");
    }
  };
  
  const handleSendMessage = (content) => {
    if (!sessionId) return alert("채팅 세션이 아직 준비되지 않았습니다.");
    const userMessage = { sender: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);
    sendMessageMutation.mutate({ sessionId, content }); 
  };

  const handleApplyAiSuggestion = (action) => {
    if (!action || !action.type || !action.payload) return;

    switch (action.type) {
      case 'UPDATE_FIELD':
        setDocument(prev => ({
          ...prev,
          [action.payload.fieldName]: action.payload.value,
        }));
        break;
      case 'UPDATE_CLAIM':
        handleClaimChange(action.payload.index, action.payload.value);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
    
  };

  const scrollToField = (fieldName) => {
    fieldRefs.current[fieldName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>출원서 정보를 불러오는 중입니다...</p></div>;
  if (isError) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>오류가 발생했습니다. 페이지를 새로고침 해주세요.</p></div>;

  const renderTabs = () => {
    const tabsData = [
      { id: 'details', label: '발명의 상세한 설명', Icon: FileText },
      { id: 'claims', label: '청구범위', Icon: Edit3 },
      { id: 'summary', label: '요약 및 기타', Icon: Eye },
      { id: 'drawings', label: '도면', Icon: Image },
    ];
    const baseClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all";
    const activeClasses = "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200";
    const inactiveClasses = "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200";
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <nav aria-label="Tabs">
          <ul className="flex flex-wrap gap-4" role="tablist">
            {tabsData.map(tab => (
              <li key={tab.id} role="presentation">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`${baseClasses} ${activeTab === tab.id ? activeClasses : inactiveClasses}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <tab.Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isGeneratorOpen && (
        <GenerateDraftModal
          onClose={() => setIsGeneratorOpen(false)}
          onGenerate={handleGenerateDraft}
          isLoading={generateDraftMutation.isPending}
        />
      )}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{document.title || "제목 없는 출원서"}</h1>
              <p className="text-gray-600 mt-1">출원서 편집기</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsGeneratorOpen(true)} variant="special" className="w-auto">
                ✨ AI로 전체 초안 생성
              </Button>
              <button onClick={handleSaveDraft} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:bg-gray-200 transition-all">
                <Save className="w-4 h-4" /> {saveMutation.isPending ? '저장 중...' : '임시저장'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:bg-gray-400"
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? '제출 중...' : '최종 제출'}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderTabs()}
            <div className="space-y-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['title'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">발명의 명칭</label><input type="text" name="title" value={document.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="발명의 명칭을 입력하세요" /></div>
                  <div ref={el => fieldRefs.current['technicalField'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">기술분야</label><textarea name="technicalField" value={document.technicalField} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명이 속하는 기술분야를 설명하세요" /></div>
                  <div ref={el => fieldRefs.current['backgroundTechnology'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">배경기술</label><textarea name="backgroundTechnology" value={document.backgroundTechnology} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="관련된 배경기술을 설명하세요" /></div>
                  <div ref={el => fieldRefs.current['inventionDetails'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-800 mb-4">발명의 상세한 설명</h3><div className="space-y-6"><div><label className="block text-md font-medium text-gray-700 mb-2">해결하려는 과제</label><textarea name="problemToSolve" value={document.inventionDetails.problemToSolve} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="해결하려는 기술적 과제를 설명하세요" /></div><div><label className="block text-md font-medium text-gray-700 mb-2">과제의 해결 수단</label><textarea name="solution" value={document.inventionDetails.solution} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="과제를 해결하는 수단을 설명하세요" /></div><div><label className="block text-md font-medium text-gray-700 mb-2">발명의 효과</label><textarea name="effect" value={document.inventionDetails.effect} onChange={handleNestedInputChange} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명의 효과를 설명하세요" /></div></div></div>
                </div>
              )}
              {activeTab === 'claims' && (
                <div ref={el => fieldRefs.current['claims'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6"><label className="block text-lg font-semibold text-gray-800">청구범위</label><button onClick={addClaim} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"><Plus className="w-4 h-4" /> 청구항 추가</button></div>
                  <div className="space-y-6">{document.claims.map((claim, index) => (<div key={index} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center justify-between mb-3"><label className="block text-sm font-medium text-gray-700">청구항 {index + 1}</label>{document.claims.length > 1 && (<button onClick={() => removeClaim(index)} className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded-md transition-all"><Trash2 className="w-3 h-3" /> 삭제</button>)}</div><textarea value={claim} onChange={(e) => handleClaimChange(index, e.target.value)} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white" placeholder={`청구항 ${index + 1}의 내용을 입력하세요`} /></div>))}</div>
                </div>
              )}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div ref={el => fieldRefs.current['summary'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">요약</label><textarea name="summary" value={document.summary} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="발명의 요약을 입력하세요" /></div>
                  <div ref={el => fieldRefs.current['drawingDescription'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><label className="block text-lg font-semibold text-gray-800 mb-3">도면의 간단한 설명</label><textarea name="drawingDescription" value={document.drawingDescription} onChange={handleInputChange} rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="도면에 대한 간단한 설명을 입력하세요" /></div>
                </div>
              )}
              {activeTab === 'drawings' && (
                <div ref={el => fieldRefs.current['drawings'] = el} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-lg font-semibold text-gray-800">도면 업로드</label>
                    {drawingFiles.length > 0 && (
                      <span className="text-xs text-gray-500">
                        선택된 도면: {selectedImageIndex >= 0 ? selectedImageIndex + 1 : '-'} / {drawingFiles.length}
                      </span>
                    )}
                  </div>
                  <input type="file" multiple accept="image/png, image/jpeg" onChange={handleDrawingUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {isUploading && <p className="text-sm text-gray-500 mt-2">업로드 중...</p>}
                  {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {drawingFiles.map((f, index) => (
                      <div
                        key={f.fileId || index}
                        onClick={() => setSelectedDrawingId(f.fileId)}
                        className={`relative border rounded-lg overflow-hidden flex items-center justify-center p-2 cursor-pointer ${f.fileId === selectedDrawingId ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        <img
                          src={f.fileUrl}
                          alt={`도면 미리보기 ${index + 1}`}
                          className="w-full h-auto object-cover"
                        />
                        {f.fileId === selectedDrawingId && (
                          <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 bg-indigo-600 text-white rounded">선택됨</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-2">3D 모델</label>
                    {modelFile ? (
                      <ThreeDModelViewer src={modelFile.fileUrl} />
                    ) : (
                      <p className="text-sm text-gray-500">생성된 3D 모델이 없습니다.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8 flex flex-col h-[calc(100vh-4rem)]">
              <div className="flex-grow overflow-hidden">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isTyping={isAiTyping}
                  initialLoading={startChatMutation.isPending}
                  onApplySuggestion={handleApplyAiSuggestion}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleGenerate3D}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-all"
                >
                  <Box className="w-4 h-4" /> 도면 3D 변환
                </button>
                <button
                  onClick={handleAiCheck}
                  disabled={aiCheckMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  {aiCheckMutation.isPending ? '분석 중...' : 'AI 서류 검토'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;