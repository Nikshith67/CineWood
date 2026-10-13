package com.cinewood;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CineWoodApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineWoodApplication.class, args);
    }
}
