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
        try {
            ValueWrapper remoteValue = remote.get(key);
            if (remoteValue != null) {
                // Store in local cache for future access
                local.put(key, remoteValue.get());
            }
            return remoteValue; 
        } catch (RuntimeException e) {
            log.warn("Remote cache get failed for key {}. Falling back to local. {}", key, e.toString());
            return null;
        }
    }

    @Override
    public <T> T get(@NonNull Object key,@Nullable Class<T> type) {
        // Try local cache first
        T localValue = local.get(key, type);
        if (localValue != null) {
            return localValue;
        }

        // If not in local cache, try remote cache
        try {
            T remoteValue = remote.get(key, type);
            if (remoteValue != null) {
                // Store in local cache for future access
                local.put(key, remoteValue);
            }
            return remoteValue;
        } catch (RuntimeException e) {
            log.warn("Remote cache get(type) failed for key {}. Falling back to local. {}", key, e.toString());
            return null;
        }
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
            try {
                ValueWrapper remoteWrapper = remote.get(key);
                if (remoteWrapper != null) {
                    @SuppressWarnings("unchecked")
                    T value = (T) remoteWrapper.get();
                    // Populate local cache for faster subsequent access
                    local.put(key, value);
                    return value;
                }
            } catch (RuntimeException e) {
                log.warn("Remote cache get(wrapper) failed for key {}. Proceeding to load. {}", key, e.toString());
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
        try {
            remote.put(key, value);
        } catch (RuntimeException e) {
            log.warn("Remote cache put failed for key {}. Continuing with local. {}", key, e.toString());
        }
        local.put(key, value);
    }

    @Override
    public void evict(@NonNull Object key) {
        // Remove from both caches
        try {
            remote.evict(key);
        } catch (RuntimeException e) {
            log.warn("Remote cache evict failed for key {}. Continuing with local. {}", key, e.toString());
        }
        local.evict(key);
        log.info("Evicted key {} from both caches", key);
    }

    @Override
    public void clear() {
        // Clear both caches
        try {
            remote.clear();
        } catch (RuntimeException e) {
            log.warn("Remote cache clear failed. Continuing with local. {}", e.toString());
        }
        local.clear();
    }
}
