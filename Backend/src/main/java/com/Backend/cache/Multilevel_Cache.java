package com.Backend.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.concurrent.Callable;

@RequiredArgsConstructor
@Slf4j
public class Multilevel_Cache implements Cache {
    private final Cache remote;
    private final Cache local;

    @Override
    public @NonNull String getName() {
        return remote.getName();
    }

    @Override
    public @NonNull Object getNativeCache() {
        return local.getNativeCache();
    }

    @Override
    public ValueWrapper get(@NonNull Object key) {
        // Try to get from local cache first
        ValueWrapper localValue = local.get(key);
        if (localValue != null) {
            return localValue;
        }

        // If not in local cache, try remote cache
        ValueWrapper remoteValue = remote.get(key);
        if (remoteValue != null) {
            // Store in local cache for future access
            local.put(key, remoteValue.get());
        }
        return remoteValue;
    }

    @Override
    public <T> T get(@NonNull Object key,@Nullable Class<T> type) {
        // Try local cache first
        T localValue = local.get(key, type);
        if (localValue != null) {
            return localValue;
        }

        // If not in local cache, try remote cache
        T remoteValue = remote.get(key, type);
        if (remoteValue != null) {
            // Store in local cache for future access
            local.put(key, remoteValue);
        }
        return remoteValue;
    }

    @Override
    public <T> T get(@NonNull Object key, @NonNull Callable<T> valueLoader) {
        try {
            // First try local cache without forcing a type
            ValueWrapper localWrapper = local.get(key);
            if (localWrapper != null) {
                @SuppressWarnings("unchecked")
                T value = (T) localWrapper.get();
                return value;
            }

            // Next try remote cache
            ValueWrapper remoteWrapper = remote.get(key);
            if (remoteWrapper != null) {
                @SuppressWarnings("unchecked")
                T value = (T) remoteWrapper.get();
                // Populate local cache for faster subsequent access
                local.put(key, value);
                return value;
            }

            // Not found in either cache -> load
            T loaded = valueLoader.call();
            // Populate both caches
            put(key, loaded);
            return loaded;
        } catch (Exception e) {
            throw new ValueRetrievalException(key, valueLoader, e);
        }
    }

    @Override
    public void put(@NonNull Object key, @Nullable Object value) {
        // Update both caches
        remote.put(key, value);
        local.put(key, value);
    }

    @Override
    public void evict(@NonNull Object key) {
        // Remove from both caches
        remote.evict(key);
        local.evict(key);
        log.info("Evicted key {} from both caches", key);
    }

    @Override
    public void clear() {
        // Clear both caches
        remote.clear();
        local.clear();
    }
}