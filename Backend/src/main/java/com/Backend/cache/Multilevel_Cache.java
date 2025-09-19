package com.Backend.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.lang.NonNull;

import java.util.concurrent.Callable;

@RequiredArgsConstructor
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
    public <T> T get(@NonNull Object key, Class<T> type) {
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
            // Try local cache first
            T localValue = (T) local.get(key, valueLoader.getClass());
            if (localValue != null) {
                return localValue;
            }

            // Try remote cache
            T remoteValue = remote.get(key, valueLoader);
            if (remoteValue != null) {
                // Store in local cache
                local.put(key, remoteValue);
                return remoteValue;
            }

            // If not found in either cache, load the value
            T newValue = valueLoader.call();
            put(key, newValue);
            return newValue;
        } catch (Exception e) {
            throw new ValueRetrievalException(key, valueLoader, e);
        }
    }

    @Override
    public void put(@NonNull Object key, @NonNull Object value) {
        // Update both caches
        remote.put(key, value);
        local.put(key, value);
    }

    @Override
    public void evict(@NonNull Object key) {
        // Remove from both caches
        remote.evict(key);
        local.evict(key);
    }

    @Override
    public void clear() {
        // Clear both caches
        remote.clear();
        local.clear();
    }
}