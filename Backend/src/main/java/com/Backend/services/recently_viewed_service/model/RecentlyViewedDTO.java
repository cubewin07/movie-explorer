package com.Backend.services.recently_viewed_service.model;

import java.util.List;

public record RecentlyViewedDTO(
        List<RecentlyViewedItemDTO> items
) {
}
