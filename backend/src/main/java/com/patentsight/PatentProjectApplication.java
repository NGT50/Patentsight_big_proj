package com.patentsight;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;


import com.patentsight.ai.service.AiService;
import com.patentsight.file.service.FileService;
import com.patentsight.notification.service.NotificationService;
import com.patentsight.patent.service.PatentService;
import com.patentsight.review.service.ReviewService;
import com.patentsight.user.service.UserService;

@SpringBootApplication
public class PatentProjectApplication {

    private static final Logger log = LoggerFactory.getLogger(PatentProjectApplication.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(PatentProjectApplication.class, args);
        checkService(context, UserService.class);
        checkService(context, ReviewService.class);
        checkService(context, NotificationService.class);
        checkService(context, PatentService.class);
        checkService(context, FileService.class);
        checkService(context, AiService.class);
    }

    private static void checkService(ConfigurableApplicationContext context, Class<?> clazz) {
        String name = clazz.getSimpleName();
        try {
            context.getBean(clazz);
            log.info("{} loaded successfully", name);
        } catch (BeansException e) {
            log.warn("{} not loaded: {}", name, e.getMessage());
        }
    }
}

