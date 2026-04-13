package com.Backend.services.recently_viewed_service.model;

import com.Backend.services.FilmType;

public record RecentlyViewedPosting(
        FilmType type,
        Long id
) {
}
