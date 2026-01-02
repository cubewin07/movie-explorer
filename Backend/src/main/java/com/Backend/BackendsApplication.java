package com.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
    org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class
})
@EnableCaching
public class BackendsApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendsApplication.class, args);
	}

	@Bean
	public ConcurrentMapCacheManager cacheManager() {
		return new ConcurrentMapCacheManager("users", "movies", "reviews", "notifications");
	}

}
