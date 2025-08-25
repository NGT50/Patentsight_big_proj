package com.patentsight.review.service;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.review.domain.Review;
import com.patentsight.review.repository.OpinionNoticeRepository;
import com.patentsight.review.repository.ReviewRepository;
import com.patentsight.user.domain.DepartmentType;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock ReviewRepository reviewRepository;
    @Mock PatentRepository patentRepository;
    @Mock UserRepository userRepository;
    @Mock OpinionNoticeRepository opinionNoticeRepository;
    @Mock NotificationService notificationService;

    @InjectMocks ReviewServiceImpl reviewService;

    @Test
    void autoAssignWithSpecialty_mapsUtilityModelToPatentDepartment() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        patent.setType(PatentType.UTILITY_MODEL);

        User examiner = new User();
        examiner.setUserId(10L);
        examiner.setCurrentLoad(0);

        when(reviewRepository.findTopByPatent_PatentIdOrderByReviewedAtDesc(1L))
                .thenReturn(Optional.empty());
        when(userRepository.findTopByDepartmentOrderByCurrentLoadAsc(DepartmentType.PATENT))
                .thenReturn(Optional.of(examiner));

        reviewService.autoAssignWithSpecialty(patent);

        verify(userRepository).findTopByDepartmentOrderByCurrentLoadAsc(DepartmentType.PATENT);
        verify(reviewRepository).save(any(Review.class));
        verify(userRepository).save(examiner);
    }

    @Test
    void autoAssignWithSpecialty_reusesExistingReview() {
        Patent patent = new Patent();
        patent.setPatentId(2L);
        patent.setType(PatentType.PATENT);

        User examiner = new User();
        examiner.setUserId(20L);

        Review existing = new Review();
        existing.setReviewId(99L);
        existing.setPatent(patent);
        existing.setExaminer(examiner);
        existing.setDecision(Review.Decision.REVIEWING);

        when(reviewRepository.findTopByPatent_PatentIdOrderByReviewedAtDesc(2L))
                .thenReturn(Optional.of(existing));

        reviewService.autoAssignWithSpecialty(patent);

        verify(reviewRepository).save(existing);
        verify(userRepository, never()).findTopByDepartmentOrderByCurrentLoadAsc(any());
        assertEquals(Review.Decision.SUBMITTED, existing.getDecision());
    }
}
