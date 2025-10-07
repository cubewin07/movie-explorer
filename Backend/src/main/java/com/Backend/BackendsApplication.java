package com.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableCaching	
public class BackendsApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendsApplication.class, args);
	}

}
