package com.tripnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({
    com.tripnest.media.config.FileStorageProperties.class
})
public class TripNestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripNestApplication.class, args);
    }
}
