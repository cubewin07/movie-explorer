package com.Backend.services.recently_viewed_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.recently_viewed_service.model.RecentlyViewedDTO;
import com.Backend.services.recently_viewed_service.model.RecentlyViewedItemDTO;
import com.Backend.services.recently_viewed_service.model.RecentlyViewedPosting;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.StringRedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecentlyViewedService {

    private static final String KEY_PREFIX = "recently_viewed:user:";
    private static final String MOVIE_KEY_SUFFIX = "movie";
    private static final String TV_KEY_SUFFIX = "tv";
    private static final String UNION_KEY_SUFFIX = "union";
    private static final Duration RECENTLY_VIEWED_TTL = Duration.ofDays(30);
    private static final long RECENTLY_VIEWED_TTL_SECONDS = RECENTLY_VIEWED_TTL.getSeconds();
    private static final long UNION_KEY_TTL_SECONDS = Duration.ofSeconds(15).getSeconds();
    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 200;

    private final StringRedisTemplate stringRedisTemplate;

    public void addRecentlyViewed(User user, RecentlyViewedPosting posting) {
        Long userId = requireUserId(user);
        FilmType type = posting.type();
        Long tmdbId = posting.id();

        String key = Objects.requireNonNull(keyFor(userId, type));
        String member = Objects.requireNonNull(memberFor(type, tmdbId));
        double score = Instant.now().toEpochMilli();

        // Pipeline ZADD + EXPIRE to reduce round trips and connection overhead.
        stringRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            StringRedisConnection stringConnection = (StringRedisConnection) connection;
            stringConnection.zAdd(key, score, member);
            stringConnection.expire(key, RECENTLY_VIEWED_TTL_SECONDS);
            return null;
        });

        log.debug("Added recently viewed item userId={} type={} tmdbId={} score={}", userId, type, tmdbId, score);
    }

    public RecentlyViewedDTO getRecentlyViewed(User user, Integer limit) {
        Long userId = requireUserId(user);
        int safeLimit = normalizeLimit(limit);

        String movieKey = Objects.requireNonNull(keyFor(userId, FilmType.MOVIE));
        String tvKey = Objects.requireNonNull(keyFor(userId, FilmType.SERIES));
        String unionKey = Objects.requireNonNull(unionKeyFor(userId));

        List<Object> pipelineResult = stringRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            StringRedisConnection stringConnection = (StringRedisConnection) connection;
            long end = safeLimit - 1L;
            stringConnection.zUnionStore(unionKey, movieKey, tvKey);
            stringConnection.expire(unionKey, UNION_KEY_TTL_SECONDS);
            stringConnection.zRevRange(unionKey, 0, end);
            stringConnection.del(unionKey);
            return null;
        });

        List<String> members = extractMembersFromPipelineResult(pipelineResult, 2);
        List<RecentlyViewedItemDTO> items = parseMixedMembers(members);
        return new RecentlyViewedDTO(items);
    }

    private Long requireUserId(User user) {
        if (user == null || user.getId() == null) {
            throw new IllegalStateException("Authenticated user id is required");
        }
        return user.getId();
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private String keyFor(Long userId, FilmType type) {
        return KEY_PREFIX + userId + ":" + keySuffix(type);
    }

    private String keySuffix(FilmType type) {
        return type == FilmType.MOVIE ? MOVIE_KEY_SUFFIX : TV_KEY_SUFFIX;
    }

    private String memberFor(FilmType type, Long tmdbId) {
        return type.name() + ":" + tmdbId;
    }

    private String unionKeyFor(Long userId) {
        return KEY_PREFIX + userId + ":" + UNION_KEY_SUFFIX + ":" + UUID.randomUUID();
    }

    private List<RecentlyViewedItemDTO> parseMixedMembers(List<String> members) {
        if (members == null || members.isEmpty()) {
            return Collections.emptyList();
        }

        List<RecentlyViewedItemDTO> items = new ArrayList<>(members.size());

        for (String member : members) {
            if (member == null) {
                continue;
            }

            int separator = member.indexOf(':');
            if (separator <= 0 || separator == member.length() - 1) {
                log.warn("Unexpected recently viewed member value='{}'", member);
                continue;
            }

            String rawType = member.substring(0, separator);
            String rawTmdbId = member.substring(separator + 1);

            try {
                FilmType type = FilmType.valueOf(rawType);
                Long id = Long.parseLong(rawTmdbId);
                items.add(new RecentlyViewedItemDTO(type, id));
            } catch (IllegalArgumentException ex) {
                log.warn("Invalid recently viewed member value='{}'", member);
            }
        }
        return items;
    }

    private List<String> extractMembersFromPipelineResult(List<Object> pipelineResult, int index) {
        if (pipelineResult == null || pipelineResult.size() <= index) {
            return Collections.emptyList();
        }
        Object raw = pipelineResult.get(index);
        if (!(raw instanceof Set<?> rawSet) || rawSet.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> members = new ArrayList<>(rawSet.size());
        for (Object item : rawSet) {
            if (item != null) {
                members.add(item.toString());
            }
        }
        return members;
    }
}
