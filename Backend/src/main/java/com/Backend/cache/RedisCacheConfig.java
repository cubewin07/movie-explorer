package com.Backend.cache;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisCacheConfig {
   @Bean
    public RedisCacheManager redisCacheManagercacheManager(RedisConnectionFactory factory) {
       KryoRedisSerializer<Object> serializer = new KryoRedisSerializer<>(Object.class);
       RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
               .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
               .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
               .entryTtl(java.time.Duration.ofMinutes(10));
        return RedisCacheManager.builder(factory).cacheDefaults(config).enableCreateOnMissingCache().build();
    }
}
