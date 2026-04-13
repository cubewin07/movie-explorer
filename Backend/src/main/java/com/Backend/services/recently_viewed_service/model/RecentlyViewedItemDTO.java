package com.Backend.services.recently_viewed_service.model;

import com.Backend.services.FilmType;

public record RecentlyViewedItemDTO(
        FilmType type,
        Long id
) {
}
