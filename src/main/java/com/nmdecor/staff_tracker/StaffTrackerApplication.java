package com.nmdecor.staff_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.nmdecor.staff_tracker.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class StaffTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(StaffTrackerApplication.class, args);
    }
}
