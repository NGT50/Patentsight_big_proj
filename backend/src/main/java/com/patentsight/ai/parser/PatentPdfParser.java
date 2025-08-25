package com.patentsight.ai.parser;

import com.patentsight.ai.dto.ParsePdfResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class PatentPdfParser {

    private PatentPdfParser() {}

    /** -------------- 1) 전처리 (기존과 동일) -------------- */
    public static String preprocess(String raw) {
        String s = raw;
        s = s.replace("\r\n", "\n").replace("\r", "\n");
        s = s.replaceAll("(?m)^\\s*공개특허\\s.*$", "");
        s = s.replaceAll("(?m)^\\s*-\\s*\\d+\\s*-\\s*$", "");
        s = Pattern.compile("(?m)^(?:\\s*[가-힣]\\s*){2,}$")
                .matcher(s)
                .replaceAll(match -> match.group().replace(" ", ""));
        s = s.replaceAll("([가-힣a-zA-Z0-9])-(?:\\n)\\s*([가-힣a-zA-Z0-9])", "$1$2");
        s = s.replaceAll("[ \\t\\f\\u00A0]+", " ");
        s = s.replaceAll("\\n{3,}", "\n\n");
        return s.trim();
    }

    /** -------------- 2) 섹션 파싱 (업그레이드됨) -------------- */
    public static ParsePdfResponse parse(String text) {
        ParsePdfResponse res = new ParsePdfResponse();

        // 파싱을 멈출 다음 섹션 제목들을 미리 정의합니다.
        final String NEXT_HEADER_REGEX = "(기술분야|배경기술|발명의내용|해결하려는과제|과제의해결수단|발명의효과|도면의간단한설명|청구범위|부호의설명|발명의설명|요약)";

        // 제목 파싱 (기존과 동일)
        String title = firstMatch(text, "(?m)^\\(\\s*54\\s*\\)\\s*발명의\\s*명칭\\s*(.+)$", 1);
        if (isBlank(title)) {
            title = firstMatch(text, "(?m)^\\s*발명의\\s*명칭\\s*(.+)$", 1);
        }
        if (isBlank(title)) {
            title = firstMatch(text, "(?s)^(.+?)\\n\\(\\s*57\\s*\\)\\s*요\\s*약", 1);
        }
        res.setTitle(safe(title, "제목 없음"));

        // 각 섹션을 NEXT_HEADER_REGEX를 사용해 더 정확하게 추출합니다.
        res.setTechnicalField(emptyToNull(section(text, "기술분야", NEXT_HEADER_REGEX)));
        res.setBackgroundTechnology(emptyToNull(section(text, "배경기술", NEXT_HEADER_REGEX)));

        // '발명의 내용' 세부 파싱 로직 개선
        ParsePdfResponse.InventionDetails details = new ParsePdfResponse.InventionDetails();
        details.setProblemToSolve(emptyToNull(section(text, "해결하려는과제", NEXT_HEADER_REGEX)));
        details.setSolution(emptyToNull(section(text, "과제의해결수단", NEXT_HEADER_REGEX)));
        details.setEffect(emptyToNull(section(text, "발명의효과", NEXT_HEADER_REGEX)));

        // 만약 세부 항목이 하나도 없다면, '발명의내용' 전체를 찾아서 넣어줍니다.
        if (isBlank(details.getProblemToSolve()) && isBlank(details.getSolution()) && isBlank(details.getEffect())) {
            String inventionBlock = section(text, "발명의내용", NEXT_HEADER_REGEX);
            details.setProblemToSolve(inventionBlock); // 이 경우에만 통째로 할당
        }
        res.setInventionDetails(details);

        // 청구범위 파싱
        res.setClaims(parseClaims(text));

        return res;
    }

    /** -------------- Helper 메소드들 (업그레이드됨) -------------- */

    private static String section(String text, String startHeaderRegex, String nextHeaderRegex) {
        Pattern p = Pattern.compile("(?is)" +
                "(?:" + startHeaderRegex + ")\\s*\\n+" +
                "(.+?)" +
                "(?=\\n\\s*(?:" + nextHeaderRegex + ")\\b|\\z)");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim().replaceAll("\\[\\d{4}\\]\\s*", "");
        }
        return "";
    }

    private static String firstMatch(String text, String regex, int group) {
        Matcher m = Pattern.compile(regex).matcher(text);
        return m.find() ? m.group(group).trim() : "";
    }

    private static List<String> parseClaims(String text) {
        List<String> claims = new ArrayList<>();
        // 청구항 파싱이 '발명의 설명' 같은 다음 섹션을 침범하지 않도록 수정
        Pattern p = Pattern.compile("(?ms)^\\s*청구항\\s*(\\d+)\\s*(.+?)(?=^\\s*청구항\\s*\\d+\\s*|\\n\\s*(?:발명의설명|도면의간단한설명|요약)|\\z)");
        Matcher m = p.matcher(text);
        while (m.find()) {
            String num = m.group(1);
            String body = m.group(2).replaceAll("\\n\\s+", " ").trim();
            claims.add("청구항 " + num + " " + body);
        }
        // ... (백업 로직은 기존과 동일)
        return claims;
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private static String safe(String s, String def) { return isBlank(s) ? def : s.trim(); }
    private static String emptyToNull(String s) { return isBlank(s) ? null : s.trim(); }
}