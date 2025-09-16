package com.Backend.services.watchlist_service.controller;

import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.model.WatchlistType;
import com.Backend.services.watchlist_service.service.WatchlistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import com.Backend.config.SecurityConfig;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = WatchlistController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
)
@AutoConfigureMockMvc(addFilters = false)
@Import({})
class WatchlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockBean
    private WatchlistService watchlistService;

    @MockBean
    private com.Backend.springSecurity.jwtAuthentication.JwtFilterChain jwtFilterChain;

    private User principal() {
        return User.builder()
                .id(1L)
                .username("user")
                .email("user@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();
    }

    @Test
    @DisplayName("GET /watchlist returns user's watchlist")
    void getWatchlist_returnsOk() throws Exception {
        Watchlist wl = new Watchlist();
        wl.setUserId(1L);
        wl.setMoviesId(new ArrayList<>());
        wl.setSeriesId(new ArrayList<>());
        when(watchlistService.getWatchlist(any(User.class))).thenReturn(wl);

        mockMvc.perform(get("/watchlist")
                        .with(SecurityMockMvcRequestPostProcessors.user(principal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(1)))
                .andExpect(jsonPath("$.moviesId").isArray())
                .andExpect(jsonPath("$.seriesId").isArray());

        verify(watchlistService).getWatchlist(any(User.class));
    }

    @Test
    @DisplayName("POST /watchlist with MOVIE adds movie and returns 200")
    void addMovie_returnsOk() throws Exception {
        WatchlistPosting posting = new WatchlistPosting(WatchlistType.MOVIE, 10L);
        doNothing().when(watchlistService).addMovieToWatchlist(eq(10L), any(User.class));

        mockMvc.perform(post("/watchlist")
                        .with(SecurityMockMvcRequestPostProcessors.user(principal()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(posting)))
                .andExpect(status().isOk());

        verify(watchlistService).addMovieToWatchlist(eq(10L), any(User.class));
    }

    @Test
    @DisplayName("POST /watchlist with SERIES adds series and returns 200")
    void addSeries_returnsOk() throws Exception {
        WatchlistPosting posting = new WatchlistPosting(WatchlistType.SERIES, 33L);
        doNothing().when(watchlistService).addSeriesToWatchlist(eq(33L), any(User.class));

        mockMvc.perform(post("/watchlist")
                        .with(SecurityMockMvcRequestPostProcessors.user(principal()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(posting)))
                .andExpect(status().isOk());

        verify(watchlistService).addSeriesToWatchlist(eq(33L), any(User.class));
    }

    @Test
    @DisplayName("POST /watchlist with invalid type returns 400")
    void addInvalid_returnsBadRequest() throws Exception {
        // Simulate invalid payload by sending unknown enum as raw JSON
        String invalidJson = "{\"type\":\"UNKNOWN\",\"id\":1}";

        mockMvc.perform(post("/watchlist")
                        .with(SecurityMockMvcRequestPostProcessors.user(principal()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(watchlistService);
    }

    @Test
    @DisplayName("DELETE /watchlist with MOVIE removes movie and returns 200")
    void deleteMovie_returnsOk() throws Exception {
        WatchlistPosting posting = new WatchlistPosting(WatchlistType.MOVIE, 44L);
        doNothing().when(watchlistService).removeMovieFromWatchlist(eq(44L), any(User.class));

        mockMvc.perform(delete("/watchlist")
                        .with(SecurityMockMvcRequestPostProcessors.user(principal()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(posting)))
                .andExpect(status().isOk());

        verify(watchlistService).removeMovieFromWatchlist(eq(44L), any(User.class));
    }

    @Test
    @DisplayName("DELETE /watchlist with SERIES removes series and returns 200")
    void deleteSeries_returnsOk() throws Exception {
        WatchlistPosting posting = new WatchlistPosting(WatchlistType.SERIES, 77L);
        doNothing().when(watchlistService).removeSeriesFromWatchlist(eq(77L), any(User.class));

        mockMvc.perform(delete("/watchlist")
                        .with(SecurityMockMvcRequestPostProcessors.user(principal()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(posting)))
                .andExpect(status().isOk());

        verify(watchlistService).removeSeriesFromWatchlist(eq(77L), any(User.class));
    }
}
