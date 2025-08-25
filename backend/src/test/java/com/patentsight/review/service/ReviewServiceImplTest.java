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

        when(userRepository.findTopByDepartmentOrderByCurrentLoadAsc(DepartmentType.PATENT))
                .thenReturn(Optional.of(examiner));

        reviewService.autoAssignWithSpecialty(patent);

        verify(userRepository).findTopByDepartmentOrderByCurrentLoadAsc(DepartmentType.PATENT);
        verify(reviewRepository).save(any(Review.class));
        verify(userRepository).save(examiner);
    }
}
