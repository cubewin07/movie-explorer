package com.Backend.cache;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;



import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
public class Multilevel_CacheManager implements CacheManager {
    private final CacheManager redis;
    private final CacheManager caffeine;
    private Map<String, Cache> cacheMap = new ConcurrentHashMap<>();

    @Override
    public Cache getCache(@NonNull String name) {
        return cacheMap.computeIfAbsent(name, cacheName -> {
            Cache remote = redis.getCache(cacheName);
            Cache local = caffeine.getCache(cacheName);
            return new Multilevel_Cache(remote, local);
        });
    }

    @Override
    public Collection<String> getCacheNames() {
        return redis.getCacheNames();
    }
}
