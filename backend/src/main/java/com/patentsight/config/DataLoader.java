package com.patentsight.config; // 🚨 프로젝트의 기본 패키지 경로에 맞게 조정하세요.

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.review.domain.Review;
import com.patentsight.user.domain.DepartmentType;
import com.patentsight.user.domain.User;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatentRepository patentRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 사용자 데이터 추가
        User examiner = new User();
        examiner.setUsername("examiner1");
        examiner.setPassword(passwordEncoder.encode("password"));
        examiner.setEmail("examiner1@patentsight.com");
        examiner.setName("김검사");
        examiner.setRole("ROLE_EXAMINER");
        examiner.setDepartment(DepartmentType.PATENT); // 특허 심사관
        userRepository.save(examiner);

        User designExaminer = new User(); // 🚀 디자인 심사관 추가
        designExaminer.setUsername("design_examiner");
        designExaminer.setPassword(passwordEncoder.encode("password"));
        designExaminer.setEmail("design_examiner@patentsight.com");
        designExaminer.setName("박디자인");
        designExaminer.setRole("ROLE_EXAMINER");
        designExaminer.setDepartment(DepartmentType.DESIGN); // 디자인 심사관
        userRepository.save(designExaminer);

        // 🚀 출원인 사용자 추가
        User applicant1 = new User();
        applicant1.setUsername("applicant1");
        applicant1.setPassword(passwordEncoder.encode("password"));
        applicant1.setEmail("applicant1@example.com");
        applicant1.setName("이출원");
        applicant1.setRole("ROLE_APPLICANT");
        applicant1.setDepartment(DepartmentType.NONE);
        userRepository.save(applicant1);

        User applicant2 = new User();
        applicant2.setUsername("applicant2");
        applicant2.setPassword(passwordEncoder.encode("password"));
        applicant2.setEmail("applicant2@example.com");
        applicant2.setName("김출원");
        applicant2.setRole("ROLE_APPLICANT");
        applicant2.setDepartment(DepartmentType.NONE);
        userRepository.save(applicant2);

        User applicant3 = new User();
        applicant3.setUsername("applicant3");
        applicant3.setPassword(passwordEncoder.encode("password"));
        applicant3.setEmail("applicant3@example.com");
        applicant3.setName("박출원");
        applicant3.setRole("ROLE_APPLICANT");
        applicant3.setDepartment(DepartmentType.NONE);
        userRepository.save(applicant3);

        User applicant4 = new User();
        applicant4.setUsername("applicant4");
        applicant4.setPassword(passwordEncoder.encode("password"));
        applicant4.setEmail("applicant4@example.com");
        applicant4.setName("최출원");
        applicant4.setRole("ROLE_APPLICANT");
        applicant4.setDepartment(DepartmentType.NONE);
        userRepository.save(applicant4);

        User applicant5 = new User();
        applicant5.setUsername("applicant5");
        applicant5.setPassword(passwordEncoder.encode("password"));
        applicant5.setEmail("applicant5@example.com");
        applicant5.setName("정출원");
        applicant5.setRole("ROLE_APPLICANT");
        applicant5.setDepartment(DepartmentType.NONE);
        userRepository.save(applicant5);


        // 특허 데이터 추가 (기존 코드와 동일)
        Patent patent1 = new Patent();
        patent1.setTitle("스마트폰 케이스");
        patent1.setApplicantId(applicant1.getUserId()); // 🚀 출원인 ID 매핑
        patent1.setApplicationNumber("10-2023-0123456");
        patent1.setSummary("휴대폰을 보호하는 신기술 케이스");
        patent1.setSubmittedAt(LocalDateTime.now().minusDays(5));
        patent1.setStatus(PatentStatus.REVIEWING);
        patent1.setType(PatentType.PATENT);
        patentRepository.save(patent1);

        Patent patent2 = new Patent();
        patent2.setTitle("차세대 공기청정기");
        patent2.setApplicantId(applicant2.getUserId()); // 🚀 출원인 ID 매핑
        patent2.setApplicationNumber("10-2023-0123457");
        patent2.setSummary("미세먼지를 완벽하게 제거하는 공기청정기");
        patent2.setSubmittedAt(LocalDateTime.now().minusDays(10));
        patent2.setStatus(PatentStatus.SUBMITTED);
        patent2.setType(PatentType.PATENT);
        patentRepository.save(patent2);

        // 리뷰 데이터 추가 (userId=1인 특허 검토관에게 할당)
        Review review1 = new Review();
        review1.setExaminer(examiner);
        review1.setPatent(patent1);
        review1.setDecision(Review.Decision.PENDING);
        review1.setComment("서류 검토 필요");
        review1.setReviewedAt(LocalDateTime.now().minusDays(2));
        review1.setReviewType(PatentType.PATENT);
        reviewRepository.save(review1);

        Review review2 = new Review();
        review2.setExaminer(examiner);
        review2.setPatent(patent2);
        review2.setDecision(Review.Decision.PENDING);
        review2.setComment("추가 자료 요청");
        review2.setReviewedAt(LocalDateTime.now().minusDays(7));
        review2.setReviewType(PatentType.PATENT);
        reviewRepository.save(review2);

        // 🚀 디자인 심사 데이터 추가 (design_examiner에게 할당)
        // 디자인 특허 1
        Patent designPatent1 = new Patent();
        designPatent1.setTitle("혁신적인 의자 디자인");
        designPatent1.setApplicantId(applicant1.getUserId()); // 🚀 출원인 ID 매핑
        designPatent1.setApplicationNumber("20-2023-0001001");
        designPatent1.setSummary("인체공학적 디자인의 의자");
        designPatent1.setSubmittedAt(LocalDateTime.now().minusDays(3));
        designPatent1.setStatus(PatentStatus.REVIEWING);
        designPatent1.setType(PatentType.DESIGN);
        patentRepository.save(designPatent1);

        Review designReview1 = new Review();
        designReview1.setExaminer(designExaminer);
        designReview1.setPatent(designPatent1);
        designReview1.setDecision(Review.Decision.APPROVE);
        designReview1.setComment("디자인 독창성 검토");
        designReview1.setReviewedAt(LocalDateTime.now().minusDays(1));
        designReview1.setReviewType(PatentType.DESIGN);
        reviewRepository.save(designReview1);

        // 디자인 특허 2
        Patent designPatent2 = new Patent();
        designPatent2.setTitle("미래형 자동차 외관 디자인");
        designPatent2.setApplicantId(applicant2.getUserId()); // � 출원인 ID 매핑
        designPatent2.setApplicationNumber("20-2023-0001002");
        designPatent2.setSummary("공기역학적이고 세련된 자동차 외관");
        designPatent2.setSubmittedAt(LocalDateTime.now().minusDays(8));
        designPatent2.setStatus(PatentStatus.SUBMITTED);
        designPatent2.setType(PatentType.DESIGN);
        patentRepository.save(designPatent2);

        Review designReview2 = new Review();
        designReview2.setExaminer(designExaminer);
        designReview2.setPatent(designPatent2);
        designReview2.setDecision(Review.Decision.PENDING);
        designReview2.setComment("차량 디자인 규정 준수 여부 확인");
        designReview2.setReviewedAt(LocalDateTime.now().minusDays(5));
        designReview2.setReviewType(PatentType.DESIGN);
        reviewRepository.save(designReview2);

        // 디자인 특허 3
        Patent designPatent3 = new Patent();
        designPatent3.setTitle("스마트 워치 UI 디자인");
        designPatent3.setApplicantId(applicant3.getUserId()); // 🚀 출원인 ID 매핑
        designPatent3.setApplicationNumber("20-2023-0001003");
        designPatent3.setSummary("직관적이고 사용자 친화적인 스마트 워치 인터페이스");
        designPatent3.setSubmittedAt(LocalDateTime.now().minusDays(12));
        designPatent3.setStatus(PatentStatus.REVIEWING);
        designPatent3.setType(PatentType.DESIGN);
        patentRepository.save(designPatent3);

        Review designReview3 = new Review();
        designReview3.setExaminer(designExaminer);
        designReview3.setPatent(designPatent3);
        designReview3.setDecision(Review.Decision.PENDING);
        designReview3.setComment("UI/UX 가이드라인 적합성 검토");
        designReview3.setReviewedAt(LocalDateTime.now().minusDays(10));
        designReview3.setReviewType(PatentType.DESIGN);
        reviewRepository.save(designReview3);

        // 디자인 특허 4 (심사 완료 상태)
        Patent designPatent4 = new Patent();
        designPatent4.setTitle("친환경 건축물 외장 디자인");
        designPatent4.setApplicantId(applicant4.getUserId()); // 🚀 출원인 ID 매핑
        designPatent4.setApplicationNumber("20-2023-0001004");
        designPatent4.setSummary("에너지 효율을 높인 친환경 건물 디자인");
        designPatent4.setSubmittedAt(LocalDateTime.now().minusDays(20));
        designPatent4.setStatus(PatentStatus.APPROVED); // 심사 완료
        designPatent4.setType(PatentType.DESIGN);
        patentRepository.save(designPatent4);

        Review designReview4 = new Review();
        designReview4.setExaminer(designExaminer);
        designReview4.setPatent(designPatent4);
        designReview4.setDecision(Review.Decision.APPROVE); // 승인
        designReview4.setComment("디자인 등록 승인됨");
        designReview4.setReviewedAt(LocalDateTime.now().minusDays(15));
        designReview4.setReviewType(PatentType.DESIGN);
        reviewRepository.save(designReview4);

        // 디자인 특허 5 (보류 상태)
        Patent designPatent5 = new Patent();
        designPatent5.setTitle("스마트 가전제품 디자인");
        designPatent5.setApplicantId(applicant5.getUserId()); // 🚀 출원인 ID 매핑
        designPatent5.setApplicationNumber("20-2023-0001005");
        designPatent5.setSummary("미니멀리즘을 적용한 스마트 냉장고 디자인");
        designPatent5.setSubmittedAt(LocalDateTime.now().minusDays(7));
        designPatent5.setStatus(PatentStatus.REVIEWING);
        designPatent5.setType(PatentType.DESIGN);
        patentRepository.save(designPatent5);

        Review designReview5 = new Review();
        designReview5.setExaminer(designExaminer);
        designReview5.setPatent(designPatent5);
        designReview5.setDecision(Review.Decision.PENDING); // 보류
        designReview5.setComment("일부 디자인 요소 수정 요청");
        designReview5.setReviewedAt(LocalDateTime.now().minusDays(3));
        designReview5.setReviewType(PatentType.DESIGN);
        reviewRepository.save(designReview5);


        System.out.println("✅ 테스트 데이터가 성공적으로 추가되었습니다.");
    }
}