package com.Backend.cache;

import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Qualifier;


@Configuration
public class Multilevel_CacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager(
        @Qualifier("caffeineCacheManager")CacheManager caffeine,
        @Qualifier("redisCacheManager")CacheManager redis
    ) {
        return new Multilevel_CacheManager(caffeine, redis);
    }
}
