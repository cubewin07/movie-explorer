package com.Backend.services.user_service.model;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistDTO {
    private Set<Long> seriesId;
    private Set<Long> moviesId;
}
