package com.Backend.services.general_test;

import com.Backend.services.notification_service.model.NotificationDTO;
import com.Backend.services.notification_service.service.NotificationService;
import com.Backend.services.credit_service.model.Credit;
import com.Backend.services.credit_service.model.FilmRole;
import com.Backend.services.credit_service.model.Role;
import com.Backend.services.credit_service.model.RoleGroup;
import com.Backend.services.credit_service.repository.CreditRepository;
import com.Backend.services.credit_service.repository.FilmRoleRepository;
import com.Backend.services.credit_service.repository.RoleRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.model.TmdbCreditsResponse;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.FilmService;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.model.Genre;
import com.Backend.services.genre_service.repository.GenreRepository;
import com.Backend.services.keyword_service.model.Keyword;
import com.Backend.services.keyword_service.repository.KeywordRepository;
import com.Backend.services.recommendation_service.model.Recommendation;
import com.Backend.services.recommendation_service.model.RecommendationId;
import com.Backend.services.recommendation_service.model.RecommendationResultDTO;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.recommendation_service.service.RecommendationService;
import com.Backend.services.recommendation_service.snapshot.service.RecommendationSnapshotQueryService;
import com.Backend.services.recommendation_service.snapshot.service.RecommendationSnapshotRecomputeService;
import com.Backend.services.recommendation_service.snapshot.service.CandidatePassFilter;
import com.Backend.services.recommendation_service.snapshot.model.RecommendationRecomputeTriggeredBy;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecomputeTaskRepository;
import com.Backend.services.sync_service.model.SyncAttemptResult;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.model.SyncTask;
import com.Backend.services.sync_service.model.SyncTaskStatus;
import com.Backend.services.sync_service.service.FilmSyncTaskService;
import com.Backend.services.sync_service.service.FilmEnrichmentStateService;
import com.Backend.services.sync_service.repository.SyncTaskRepository;
import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.model.DTO.UpdateUserDTO;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import com.Backend.services.watchlist_service.service.WatchlistService;
import com.Backend.services.FilmType;
import com.Backend.services.friend_service.model.EmailBody;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.model.DTO.FriendUpdatingBody;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.http.MediaType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@EnableCaching
@ContextConfiguration(initializers = com.Backend.test.DotenvTestInitializer.class)
class SpringControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

        @Autowired
        private FilmRepository filmRepository;

        @Autowired
        private WatchlistItemRepository watchlistItemRepository;

        @Autowired
        private RecommendationRepository recommendationRepository;

        @Autowired
        private CreditRepository creditRepository;

        @Autowired
        private FilmRoleRepository filmRoleRepository;

        @Autowired
        private RoleRepository roleRepository;

        @Autowired
        private GenreRepository genreRepository;

        @Autowired
        private KeywordRepository keywordRepository;

        @Autowired
        private PlatformTransactionManager transactionManager;

        @Autowired
        private MeterRegistry meterRegistry;

        @SpyBean
        private FilmSyncTaskService filmSyncTaskService;

        @Autowired
        private FilmEnrichmentStateService filmEnrichmentStateService;

        @Autowired
        private FilmService filmService;

        @Autowired
        private RecommendationService recommendationService;

        @Autowired
        private WatchlistService watchlistService;

        @Autowired
        private WatchlistRepository watchlistRepository;

        @Autowired
        private SyncTaskRepository syncTaskRepository;

        @Autowired
        private RecommendationSnapshotRecomputeService recommendationSnapshotRecomputeService;

        @Autowired
        private RecommendationSnapshotQueryService recommendationSnapshotQueryService;

        @Autowired
        private CandidatePassFilter candidatePassFilter;

        @Autowired
        private UserRecomputeTaskRepository userRecomputeTaskRepository;

        @MockBean
        private TmdbClient tmdbClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String register(String username, String email, String password) throws Exception {
        RegisterDTO req = new RegisterDTO(username, email, password);
        MvcResult result = mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        String body = result.getResponse().getContentAsString();
        Map<?,?> map = objectMapper.readValue(body, Map.class);
        return (String) map.get("token");
    }

    // Friend helpers
    private String registerAndAuth(String username, String email) throws Exception {
        register(username, email, "password123");
        return authenticate(email, "password123");
    }

    private String authenticate(String email, String password) throws Exception {
        AuthenticateDTO req = new AuthenticateDTO(email, password);
        MvcResult result = mockMvc.perform(post("/user/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        String body = result.getResponse().getContentAsString();
        Map<?,?> map = objectMapper.readValue(body, Map.class);
        return (String) map.get("token");
    }
    
    private String bearer(String token) {
        return "Bearer " + token;
    }
    
    private Long getUserId(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/user/me")
                .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        String body = result.getResponse().getContentAsString();
        Map<?,?> map = objectMapper.readValue(body, Map.class);
        return Long.valueOf(((Integer) map.get("id")).longValue());
    }

    // Watchlist helpers
    private void addMovie(String token, long id) throws Exception {
        WatchlistPosting posting = new WatchlistPosting(FilmType.MOVIE, id);
        mockMvc.perform(post("/watchlist")
        .header("Authorization", bearer(token))
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(posting)))
        .andExpect(status().isOk());
    }
    
    private void addSeries(String token, long id) throws Exception {
        WatchlistPosting posting = new WatchlistPosting(FilmType.SERIES, id);
        mockMvc.perform(post("/watchlist")
        .header("Authorization", bearer(token))
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(posting)))
        .andExpect(status().isOk());
    }
    
    private void removeMovie(String token, long id) throws Exception {
        mockMvc.perform(delete("/watchlist")
                        .header("Authorization", bearer(token))
                        .param("id", String.valueOf(id))
                        .param("type", FilmType.MOVIE.name())) // "MOVIE"
                .andExpect(status().isOk());
    }
    
    private void removeSeries(String token, long id) throws Exception {
        mockMvc.perform(delete("/watchlist")
                        .header("Authorization", bearer(token))
                        .param("id", String.valueOf(id))
                        .param("type", FilmType.SERIES.name())) // "MOVIE"
                .andExpect(status().isOk());
    }

        private TmdbFilmResponse movieResponse(long id) {
                TmdbFilmResponse response = new TmdbFilmResponse();
                response.setId(id);
                response.setTitle("Movie " + id);
                response.setReleaseDate("2020-01-01");
                response.setVoteAverage(7.5);
                response.setBackdropPath("/backdrop-movie.jpg");
                return response;
        }

        private TmdbFilmResponse seriesResponse(long id) {
                TmdbFilmResponse response = new TmdbFilmResponse();
                response.setId(id);
                response.setName("Series " + id);
                response.setFirstAirDate("2021-01-01");
                response.setVoteAverage(8.1);
                response.setBackdropPath("/backdrop-series.jpg");
                return response;
        }

        private Role ensureRoleExists(String roleCode, String roleName, RoleGroup roleGroup) {
                return roleRepository.findByRoleCode(roleCode)
                        .orElseGet(() -> {
                                try {
                                        return roleRepository.saveAndFlush(Role.builder()
                                                .roleCode(roleCode)
                                                .roleName(roleName)
                                                .roleGroup(roleGroup)
                                                .build());
                                } catch (DataIntegrityViolationException ex) {
                                        return roleRepository.findByRoleCode(roleCode).orElseThrow(() -> ex);
                                }
                        });
        }
    
    @Test
    @Order(1)
    @DisplayName("GET /user/all returns list of users")
    void getAllUsers_returnsOk() throws Exception {
        // Register two users
        register("john", "john@example.com", "password123");
        register("jane", "jane@example.com", "password123");
        User john = userRepository.findByEmail("john@example.com").orElseThrow();
        john.setRole(ROLE.ROLE_ADMIN);
        userRepository.save(john);
        // Authenticate to get a token
        String token = authenticate("john@example.com", "password123");
        
        mockMvc.perform(get("/user/all")
        .header("Authorization", bearer(token)))
        .andDo(print())
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[*].email", containsInAnyOrder("john@example.com", "jane@example.com")))
        .andExpect(jsonPath("$[*].username", containsInAnyOrder("john@example.com", "jane@example.com")));
    }
    
    @Test
    @Order(2)
    @DisplayName("POST /user register returns token")
    void registerUser_returnsToken() throws Exception {
        RegisterDTO req = new RegisterDTO("john2", "john2@example.com", "password123");
        
        mockMvc.perform(post("/user/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token", not(emptyString())));
    }
    
    @Test
    @Order(3)
    @DisplayName("POST /user/authenticate returns token")
    void authenticateUser_returnsToken() throws Exception {
        // Ensure user exists
        register("authuser", "auth@example.com", "password123");
        
        AuthenticateDTO req = new AuthenticateDTO("auth@example.com", "password123");
        mockMvc.perform(post("/user/authenticate")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token", not(emptyString())));
    }
    
    @Test
    @Order(4)
    @DisplayName("GET /user/me returns authenticated user from principal")
    void getMe_returnsPrincipalUser() throws Exception {
        register("metest", "me@example.com", "password123");
        String token = authenticate("me@example.com", "password123");
        
        mockMvc.perform(get("/user/me")
        .header("Authorization", bearer(token)))
        .andDo(print())
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", greaterThanOrEqualTo(1)))
        .andExpect(jsonPath("$.email", is("me@example.com")))
        .andExpect(jsonPath("$.username", is("metest")));
    }
    
    @Test
    @Order(5)
    @DisplayName("PUT /user updates and returns user")
    void updateUser_returnsUpdated() throws Exception {
        register("old", "old@example.com", "password123");
        String token = authenticate("old@example.com", "password123");
        
        UpdateUserDTO req = new UpdateUserDTO("new@example.com", "newname");
        
        mockMvc.perform(put("/user")
        .header("Authorization", bearer(token))
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", greaterThanOrEqualTo(1)))
        // username getter returns email due to UserDetails override
        .andExpect(jsonPath("$.username", is("newname")))
        .andExpect(jsonPath("$.email", is("new@example.com")));
    }
    
    @Test
    @Order(6)
    @DisplayName("DELETE /user deletes and returns message")
    void deleteUser_returnsMessage() throws Exception {
        register("abc", "abc@example.com", "password123");
        String token = authenticate("abc@example.com", "password123");
        
        // Fetch current user to get ID
        MvcResult meResult = mockMvc.perform(get("/user/me")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andReturn();
        String meBody = meResult.getResponse().getContentAsString();
        Map<?,?> meMap = objectMapper.readValue(meBody, Map.class);
        Integer id = (Integer) meMap.get("id");
        
        mockMvc.perform(delete("/user")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message", is("User with id " + id + " deleted successfully")));
    }
    
    // Watchlist test
    @Test
    @Order(7)
    @DisplayName("GET /watchlist returns empty on new user, then reflects changes")
    void watchlist_get_add_remove_flow() throws Exception {
        System.out.println( "watchlist_get_add_remove_flow" );
        register("wluser", "wl@example.com", "password123");
        String token = authenticate("wl@example.com", "password123");
                Long userId = getUserId(token);
        
        // Initially empty
        mockMvc.perform(get("/watchlist")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.moviesId", hasSize(0)))
        .andExpect(jsonPath("$.seriesId", hasSize(0)));
        
        // Add movie and series
        long movieId = 101L;
        long seriesId = 202L;
        when(tmdbClient.fetchFilmDetails(movieId, FilmType.MOVIE)).thenReturn(movieResponse(movieId));
        when(tmdbClient.fetchFilmDetails(seriesId, FilmType.SERIES)).thenReturn(seriesResponse(seriesId));
        addMovie(token, movieId);
        addSeries(token, seriesId);
        
        mockMvc.perform(get("/watchlist")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.moviesId", contains(101)))
        .andExpect(jsonPath("$.seriesId", contains(202)));

        Film movieFilm = filmRepository.findByFilmIdAndType(movieId, FilmType.MOVIE).orElseThrow();
        Film seriesFilm = filmRepository.findByFilmIdAndType(seriesId, FilmType.SERIES).orElseThrow();
        assertThat(watchlistItemRepository.existsById(new WatchlistItemId(userId, movieFilm.getInternalId())))
                .isTrue();
        assertThat(watchlistItemRepository.existsById(new WatchlistItemId(userId, seriesFilm.getInternalId())))
                .isTrue();
        
        // Remove them
        removeMovie(token, movieId);
        removeSeries(token, seriesId);
        
        mockMvc.perform(get("/watchlist")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.moviesId", not(hasItem(101))))
        .andExpect(jsonPath("$.seriesId", not(hasItem(202))));

        assertThat(watchlistItemRepository.existsById(new WatchlistItemId(userId, movieFilm.getInternalId())))
                .isFalse();
        assertThat(watchlistItemRepository.existsById(new WatchlistItemId(userId, seriesFilm.getInternalId())))
                .isFalse();
        assertThat(filmRepository.findByFilmIdAndType(movieId, FilmType.MOVIE)).isPresent();
        assertThat(filmRepository.findByFilmIdAndType(seriesId, FilmType.SERIES)).isPresent();
    }

    // Friend test
    @Test
    @Order(8)
    @DisplayName("Friend request send/accept/delete flow")
    void friend_request_accept_delete_flow() throws Exception {
        // user A and B
        String tokenA = registerAndAuth("alice", "alice@example.com");
        String tokenB = registerAndAuth("bob", "bob@example.com");
    
        // A sends friend request to B
        mockMvc.perform(post("/friends/request")
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmailBody("bob@example.com"))))
                .andExpect(status().isOk());

        Long AliceId = getUserId(tokenA);
        Long BobId = getUserId(tokenB);
    
        // B authenticates and accepts
        authenticate("bob@example.com", "password123");
        mockMvc.perform(put("/friends/update")
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new FriendUpdatingBody(AliceId, Status.ACCEPTED))))
                .andExpect(status().isOk());
    
        // Both should see each other in friends list
        mockMvc.perform(get("/friends/friend")
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].user.email", hasItem("bob@example.com")))
                .andExpect(jsonPath("$[*].status", hasItem(false)));
    
        mockMvc.perform(get("/friends/friend")
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].user.email", hasItem("alice@example.com")))
                .andExpect(jsonPath("$[*].status", hasItem(false)));
    
        // A deletes friendship
        mockMvc.perform(delete("/friends/delete")
                        .header("Authorization", bearer(tokenA))
                        .param("id", String.valueOf(BobId)))
                .andExpect(status().isOk());
    }

    @Test
    @Order(9)
    @DisplayName("GET /user/search returns paginated search results")
    void searchUsers_returnsPaginatedResults() throws Exception {
        // Register test users
        String token = register("search_test", "search_test@example.com", "password123");
        register("test_user1", "test1@example.com", "password123");
        register("test_user2", "test2@example.com", "password123");
        register("other_user", "other@example.com", "password123");

        // Search for users with "test" in their username
        mockMvc.perform(get("/user/search")
                .header("Authorization", bearer(token))
                .param("query", "test")
                .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.content[*].username", containsInAnyOrder(
                        "metest",
                        "test_user1",
                        "test_user2"
                )))
                .andExpect(jsonPath("$.totalElements", is(3)))
                .andExpect(jsonPath("$.number", is(0)))
                .andExpect(jsonPath("$.size", is(20)));

        // Search with no matches
        mockMvc.perform(get("/user/search")
                .header("Authorization", bearer(token))
                .param("query", "nonexistent")
                .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", is(0)));
    }

    // Notification tests
    @Test
    @Order(10)
    @DisplayName("PUT /notifications/read/{id} marks single notification as read")
    void markSingleNotificationAsRead() throws Exception {
        String token = registerAndAuth("notif_user1", "notif1@example.com");
        Long userId = getUserId(token);
        User user = new User();
        user.setId(userId);
        user.setEmail("notif1@example.com");

        // Create a notification using the service
        notificationService.createNotification(user, "chat", 123L, "Test message");

        // Fetch the created notification ID from repo
        List<NotificationDTO> created = notificationService.getChatNotifications(user);
        Long notificationId = created.getFirst().getId();

        mockMvc.perform(put("/notifications/read/{id}", notificationId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Marked notification as read")));
    }

    @Test
    @Order(11)
    @DisplayName("PUT /notifications/allRead marks multiple notifications as read")
    void markAllNotificationsAsRead() throws Exception {
        String token = registerAndAuth("notif_user2", "notif2@example.com");
        Long userId = getUserId(token);
        User user = new User();
        user.setId(userId);
        user.setEmail("notif2@example.com");

        // Create multiple notifications
        notificationService.createNotification(user, "chat", 100L, "Message 1");
        notificationService.createNotification(user, "chat", 200L, "Message 2");
        notificationService.createNotification(user, "chat", 300L, "Message 3");

        // Fetch notification IDs
        List<Long> ids = notificationService.getChatNotifications(user)
                .stream()
                .map(NotificationDTO::getId)
                .toList();

        Map<String, Object> requestBody = Map.of("ids", ids);

        mockMvc.perform(put("/notifications/read")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Marked your specific notifications as read")));
    }

    @Test
    @Order(12)
    @DisplayName("PUT /notifications/allRead marks all user notifications as read")
    void markAllUserNotificationsAsRead() throws Exception {
        String token = registerAndAuth("notif_user3", "notif3@example.com");
        Long userId = getUserId(token);
        User user = new User();
        user.setId(userId);
        user.setEmail("notif3@example.com");

        // Create multiple notifications of different types
        notificationService.createNotification(user, "chat", 400L, "Chat message 1");
        notificationService.createNotification(user, "chat", 500L, "Chat message 2");
        notificationService.createNotification(user, "updates", 600L, "System update");

        mockMvc.perform(put("/notifications/allRead")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Marked all notifications as read")));
    }

    @Test
    @Order(13)
    @DisplayName("DELETE /notifications/delete/{id} deletes a specific notification")
    void deleteSpecificNotification() throws Exception {
        String token = registerAndAuth("notif_user4", "notif4@example.com");
        Long userId = getUserId(token);
        User user = new User();
        user.setId(userId);
        user.setEmail("notif4@example.com");

        // Create a notification using the service
        notificationService.createNotification(user, "chat", 700L, "Notification to delete");

        // Fetch the created notification ID
        List<NotificationDTO> created = notificationService.getChatNotifications(user);
        Long notificationId = created.getFirst().getId();

        mockMvc.perform(delete("/notifications/delete/{id}", notificationId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Deleted notification")));
    }

    @Test
    @Order(14)
    @DisplayName("POST /reviews creates a review and GET /reviews returns it by filmId/type")
    void createReview_and_getByFilm() throws Exception {
        // Arrange: register and authenticate
        String email = "reviewer1@example.com";
        register("reviewer1", email, "password123");
        String token = authenticate(email, "password123");

        long filmId = 5555L;
        // Create review
        Map<String, Object> createReq = Map.of(
                "content", "Amazing movie!",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );

        MvcResult createRes = mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.content", is("Amazing movie!")))
                .andExpect(jsonPath("$.replyCount", is(0)))
                .andExpect(jsonPath("$.score", is(1)))
                .andExpect(jsonPath("$.user.email", is(email)))
                .andExpect(jsonPath("$.likedByMe", is(true)))
                .andExpect(jsonPath("$.disLikedByMe", is(false)))
                .andReturn();

        String createBody = createRes.getResponse().getContentAsString();
        Map<?,?> created = objectMapper.readValue(createBody, Map.class);
        Integer reviewId = (Integer) created.get("id");

        // Fetch by filmId/type
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(token))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].content", reviewId).value(hasItem("Amazing movie!")))
                .andExpect(jsonPath("$.content[?(@.id==%s)].score", reviewId).value(hasItem(1)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].user.email", reviewId).value(hasItem(email)));
    }

    @Test
    @Order(15)
    @DisplayName("POST /reviews/reply creates a reply; GET /reviews/reply/{id}?reviewId= returns replies; parent replyCount increments")
    void createReply_and_getReplies_and_checkParentCount() throws Exception {
        String email = "reviewer2@example.com";
        register("reviewer2", email, "password123");
        String token = authenticate(email, "password123");

        long filmId = 7777L;
        // Create parent review
        Map<String, Object> createReq = Map.of(
                "content", "Parent review",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );
        MvcResult parentRes = mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?,?> parent = objectMapper.readValue(parentRes.getResponse().getContentAsString(), Map.class);
        Integer parentId = (Integer) parent.get("id");

        // Create reply
        Map<String, Object> replyReq = Map.of(
                "content", "This is a reply",
                "replyToId", parentId
        );
        mockMvc.perform(post("/reviews/reply")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(replyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", is("This is a reply")))
                .andExpect(jsonPath("$.score", is(1)))
                .andExpect(jsonPath("$.user.email", is(email)))
                .andExpect(jsonPath("$.likedByMe", is(true)))
                .andExpect(jsonPath("$.disLikedByMe", is(false)));

        // Get replies using query param (controller expects @RequestParam)
        mockMvc.perform(get("/reviews/reply")
                        .header("Authorization", bearer(token))
                        .param("reviewId", String.valueOf(parentId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].content", is("This is a reply")))
                .andExpect(jsonPath("$.content[0].score", is(1)));

        // Parent replyCount should be 1 when fetching by film
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(token))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].replyCount", parentId).value(hasItem(1)));
    }

    @Test
    @Order(16)
    @DisplayName("GET /reviews/user returns only current user's reviews")
    void getReviewsByUser_returnsOnlyOwn() throws Exception {
        String emailA = "userA@example.com";
        String emailB = "userB@example.com";
        register("userA", emailA, "password123");
        register("userB", emailB, "password123");
        String tokenA = authenticate(emailA, "password123");
        String tokenB = authenticate(emailB, "password123");

        long filmId = 8888L;
        // A creates two reviews
        for (String content : List.of("A1", "A2")) {
            Map<String, Object> req = Map.of(
                    "content", content,
                    "filmId", filmId,
                    "type", FilmType.MOVIE.name()
            );
            mockMvc.perform(post("/reviews")
                            .header("Authorization", bearer(tokenA))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk());
        }
        // B creates one review
        Map<String, Object> reqB = Map.of(
                "content", "B1",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );
        mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isOk());

        // Fetch by user A
        mockMvc.perform(get("/reviews/user")
                        .header("Authorization", bearer(tokenA))
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].user.email", everyItem(is(emailA))))
                .andExpect(jsonPath("$[*].content", containsInAnyOrder("A1", "A2")))
                .andExpect(jsonPath("$[*].score", everyItem(is(1))));
    }

    @Test
    @Order(17)
    @DisplayName("DELETE /reviews/delete/{id}?reviewId= deletes review; lists reflect removal")
    void deleteReview_flow() throws Exception {
        String email = "reviewer3@example.com";
        register("reviewer3", email, "password123");
        String token = authenticate(email, "password123");

        long filmId = 9999L;
        Map<String, Object> createReq = Map.of(
                "content", "To be deleted",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );
        MvcResult createRes = mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?,?> created = objectMapper.readValue(createRes.getResponse().getContentAsString(), Map.class);
        Integer reviewId = (Integer) created.get("id");

        // Delete using query param (controller expects @RequestParam)
        mockMvc.perform(delete("/reviews/delete")
                        .header("Authorization", bearer(token))
                        .param("reviewId", String.valueOf(reviewId)))
                .andExpect(status().isOk());

        // Verify not present in film list
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(token))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", not(hasItem(reviewId))));

        // Verify not present in user list
        mockMvc.perform(get("/reviews/user")
                        .header("Authorization", bearer(token))
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", not(hasItem(reviewId))));
    }

    @Test
    @Order(18)
    @DisplayName("POST /votes updates like state for current user (upvote -> downvote -> remove)")
    void vote_update_flow_onReview() throws Exception {
        // Create author and reviewer
        String authorEmail = "vote_author@example.com";
        String voterEmail = "vote_voter@example.com";
        register("vote_author", authorEmail, "password123");
        register("vote_voter", voterEmail, "password123");
        String authorToken = authenticate(authorEmail, "password123");
        String voterToken = authenticate(voterEmail, "password123");

        long filmId = 424242L;
        // Author creates a review (auto-liked by author per service)
        Map<String, Object> createReq = Map.of(
                "content", "Vote me",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );
        MvcResult createRes = mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(authorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?,?> created = objectMapper.readValue(createRes.getResponse().getContentAsString(), Map.class);
        Integer reviewId = (Integer) created.get("id");

        // As voter, initially should not be liked/disliked
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(voterToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

        // Upvote by voter
        Map<String, Object> upvote = Map.of(
                "value", 1,
                "reviewId", reviewId
        );
        mockMvc.perform(post("/votes")
                        .header("Authorization", bearer(voterToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(upvote)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Succeed")));

        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(voterToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(true)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

        // Switch to downvote
        Map<String, Object> downvote = Map.of(
                "value", -1,
                "reviewId", reviewId
        );
        mockMvc.perform(post("/votes")
                        .header("Authorization", bearer(voterToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(downvote)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Succeed")));

        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(voterToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(true)));

        // Remove vote (set to 0) and ensure idempotency
        Map<String, Object> remove = Map.of(
                "value", 0,
                "reviewId", reviewId
        );
        mockMvc.perform(post("/votes")
                        .header("Authorization", bearer(voterToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(remove)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Succeed")));

        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(voterToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

        // Idempotent removal
        mockMvc.perform(post("/votes")
                        .header("Authorization", bearer(voterToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(remove)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Succeed")));

        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(voterToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

        // Author should still see their own auto-like
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(authorToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(true)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));
    }

    @Test
    @Order(19)
    @DisplayName("POST /votes requires authentication")
    void vote_requiresAuth() throws Exception {
        Map<String, Object> body = Map.of(
                "value", 1,
                "reviewId", 1
        );
        mockMvc.perform(post("/votes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is4xxClientError());
    }

    
    @Test
    @Order(20)
    @DisplayName("Anonymous GET /reviews returns items with likedByMe=false and disLikedByMe=false")
    void anonymous_getReviews_flagsAreFalse() throws Exception {
        // Arrange: create a user and a review
        String email = "anonreviews@example.com";
        register("anonreviews", email, "password123");
        String token = authenticate(email, "password123");
        long filmId = 121212L;
        Map<String, Object> createReq = Map.of(
                "content", "Anon visible review",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );
        MvcResult createRes = mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?,?> created = objectMapper.readValue(createRes.getResponse().getContentAsString(), Map.class);
        Integer reviewId = (Integer) created.get("id");

        // Act + Assert: fetch as anonymous (no Authorization header)
        mockMvc.perform(get("/reviews")
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id==%s)].content", reviewId).value(hasItem("Anon visible review")))
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));
    }

    @Test
    @Order(21)
    @DisplayName("Anonymous GET /reviews/reply returns replies with likedByMe=false and disLikedByMe=false")
    void anonymous_getReplies_flagsAreFalse() throws Exception {
        // Arrange: create a user, a parent review, and a reply
        String email = "anonreplies@example.com";
        register("anonreplies", email, "password123");
        String token = authenticate(email, "password123");

        long filmId = 343434L;
        Map<String, Object> parentReq = Map.of(
                "content", "Parent for anon reply",
                "filmId", filmId,
                "type", FilmType.MOVIE.name()
        );
        MvcResult parentRes = mockMvc.perform(post("/reviews")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(parentReq)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?,?> parent = objectMapper.readValue(parentRes.getResponse().getContentAsString(), Map.class);
        Integer parentId = (Integer) parent.get("id");

        Map<String, Object> replyReq = Map.of(
                "content", "Reply shown to anonymous",
                "replyToId", parentId
        );
        MvcResult replyRes = mockMvc.perform(post("/reviews/reply")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(replyReq)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?,?> reply = objectMapper.readValue(replyRes.getResponse().getContentAsString(), Map.class);
        Integer replyId = (Integer) reply.get("id");

        // Act + Assert: fetch replies as anonymous
        mockMvc.perform(get("/reviews/reply")
                        .param("reviewId", String.valueOf(parentId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", hasItem(replyId)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].content", replyId).value(hasItem("Reply shown to anonymous")))
                .andExpect(jsonPath("$.content[?(@.id==%s)].likedByMe", replyId).value(hasItem(false)))
                .andExpect(jsonPath("$.content[?(@.id==%s)].disLikedByMe", replyId).value(hasItem(false)));
    }

    @Test
    @Order(22)
    @DisplayName("RECOMMENDATION sync ingests filtered candidates")
    void recommendation_sync_ingests_filtered_candidates() {
        reset(tmdbClient);
        syncTaskRepository.deleteAll();
        when(tmdbClient.getAvailableTokens()).thenReturn(10.0d);

        long sourceTmdbId = 900_001L;
        List<TmdbSimilarItem> fetched = List.of(
                new TmdbSimilarItem(sourceTmdbId, "Self",           "2024-01-01", "/self.jpg",    null, null, List.of(28)),
                new TmdbSimilarItem(900_002L,      "No date",        null,         "/no-date.jpg", null, null, List.of(28)),
                new TmdbSimilarItem(900_003L,      "Invalid date",  "2020-99-99", "/invalid.jpg", null, null, List.of(12)),
                new TmdbSimilarItem(900_004L,      "Valid A",        "2022-06-01", "/a.jpg",       7.5,  "en", List.of(28, 12)),
                new TmdbSimilarItem(900_004L,      "Duplicate A",   "2022-06-01", "/a2.jpg",      7.5,  "en", List.of(28))
        );
        when(tmdbClient.fetchRecommendations(sourceTmdbId, FilmType.MOVIE)).thenReturn(fetched);

        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        Film source = tx.execute(status -> filmRepository.saveAndFlush(Film.builder()
                .filmId(sourceTmdbId)
                .type(FilmType.MOVIE)
                .title("Source")
                .recommendationSyncCompleted(false)
                .build()));

        assertThat(source).isNotNull();
        assertThat(source.getInternalId()).isNotNull();

        tx.executeWithoutResult(status -> {
            Film managedSource = filmRepository.findById(source.getInternalId()).orElseThrow();

            SyncAttemptResult result = filmSyncTaskService.syncNowOrQueue(
                    managedSource,
                    managedSource.getFilmId(),
                    SyncCategory.RECOMMENDATION
            );

            assertThat(result.syncSucceeded()).isTrue();
            assertThat(managedSource.getRecommendationSyncCompleted()).isTrue();
        });

        Film reloadedSource = filmRepository.findById(source.getInternalId()).orElseThrow();
        assertThat(reloadedSource.getRecommendationSyncCompleted()).isTrue();

        // Filtering guard: invalid date/missing date candidates should never be persisted.
        assertThat(filmRepository.findByFilmIdAndType(900_002L, FilmType.MOVIE)).isEmpty();
        assertThat(filmRepository.findByFilmIdAndType(900_003L, FilmType.MOVIE)).isEmpty();

        Film candidateA = filmRepository.findByFilmIdAndType(900_004L, FilmType.MOVIE).orElseThrow();

        Set<Long> recommendedIds = recommendationRepository.findRecommendedFilmIdsByFilmIds(List.of(source.getInternalId()));
        assertThat(recommendedIds).contains(candidateA.getInternalId());
        assertThat(recommendedIds).doesNotContain(source.getInternalId());
    }

    @Test
    @Order(23)
    @DisplayName("Repeated sync replaces edges")
    void recommendation_ingestion_is_replace_semantics() {
        reset(tmdbClient);
        syncTaskRepository.deleteAll();
        when(tmdbClient.getAvailableTokens()).thenReturn(10.0d);

        long sourceTmdbId = 910_001L;
        Film source = filmRepository.saveAndFlush(Film.builder()
                .filmId(sourceTmdbId)
                .type(FilmType.MOVIE)
                .title("Source")
                .build());

        when(tmdbClient.fetchRecommendations(sourceTmdbId, FilmType.MOVIE)).thenReturn(List.of(
                new TmdbSimilarItem(910_010L, "First", "2023-01-01", "/first.jpg", 7.0, "en", List.of(28))
        ));
        recommendationService.syncRecommendationsForFilm(sourceTmdbId, source);

        Film firstCandidate = filmRepository.findByFilmIdAndType(910_010L, FilmType.MOVIE).orElseThrow();
        Set<Long> firstRecommended = recommendationRepository.findRecommendedFilmIdsByFilmIds(List.of(source.getInternalId()));
        assertThat(firstRecommended).containsExactly(firstCandidate.getInternalId());

        when(tmdbClient.fetchRecommendations(sourceTmdbId, FilmType.MOVIE)).thenReturn(List.of(
                new TmdbSimilarItem(910_020L, "Second", "2024-02-02", "/second.jpg", 8.0, "fr", List.of(12))
        ));
        recommendationService.syncRecommendationsForFilm(sourceTmdbId, source);

        Film secondCandidate = filmRepository.findByFilmIdAndType(910_020L, FilmType.MOVIE).orElseThrow();
        Set<Long> secondRecommended = recommendationRepository.findRecommendedFilmIdsByFilmIds(List.of(source.getInternalId()));
        assertThat(secondRecommended).containsExactly(secondCandidate.getInternalId());
    }

    @Test
    @Order(24)
    @DisplayName("POST /watchlist returns quickly while background sync continues")
    void addToWatchlist_returnsWithoutBlockingBackgroundSync() throws Exception {
        reset(filmSyncTaskService, tmdbClient);
        syncTaskRepository.deleteAll();

        User user = createUserWithWatchlist("watchlist-async");
        WatchlistPosting posting = new WatchlistPosting(FilmType.MOVIE, 771_009L);

        TmdbFilmResponse details = new TmdbFilmResponse();
        details.setId(posting.id());
        details.setTitle("Async Candidate");
        details.setVoteAverage(7.4d);
        details.setReleaseDate("2025-02-11");
        details.setBackdropPath("/async.jpg");
        details.setOriginalLanguage("en");
        when(tmdbClient.fetchFilmDetails(posting.id(), posting.type())).thenReturn(details);

        CountDownLatch firstSyncInvocation = new CountDownLatch(1);
        CountDownLatch unblockSync = new CountDownLatch(1);
        CountDownLatch addCompleted = new CountDownLatch(1);

        doAnswer(invocation -> {
            firstSyncInvocation.countDown();
            unblockSync.await(5, TimeUnit.SECONDS);
            return SyncAttemptResult.alreadySynced();
                }).when(filmSyncTaskService).syncNowOrQueue(any(Film.class), anyLong(), any(SyncCategory.class), anyLong());

        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            executor.submit(() -> {
                watchlistService.addToWatchlist(posting, user);
                addCompleted.countDown();
            });

            assertThat(firstSyncInvocation.await(3, TimeUnit.SECONDS)).isTrue();
            assertThat(addCompleted.getCount()).isEqualTo(1L);

            unblockSync.countDown();
            assertThat(addCompleted.await(5, TimeUnit.SECONDS)).isTrue();

            Film savedFilm = filmRepository.findByFilmIdAndType(posting.id(), posting.type()).orElseThrow();
            assertThat(watchlistItemRepository.existsById(new WatchlistItemId(user.getId(), savedFilm.getInternalId())))
                    .isTrue();

            verify(filmSyncTaskService, times(2)).syncNowOrQueue(any(Film.class), eq(posting.id()), any(SyncCategory.class), eq(user.getId()));

            var categoryCaptor = ArgumentCaptor.forClass(SyncCategory.class);
            verify(filmSyncTaskService, times(2)).syncNowOrQueue(any(Film.class), eq(posting.id()), categoryCaptor.capture(), eq(user.getId()));
            assertThat(categoryCaptor.getAllValues()).containsExactlyInAnyOrder(
                    SyncCategory.ENRICHMENT,
                    SyncCategory.RECOMMENDATION
            );
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    @Order(25)
    @DisplayName("Recommendation snapshot recompute keeps partially enriched candidates safe")
    void recompute_includesPartiallyEnrichedCandidates_withZeroContributionForMissingSignals() {
        User user = createRecommendationUserWithWatchlist("rec-partial");

        Film watch = saveRecommendationFilm(100L, FilmType.MOVIE, "Watch", "en", LocalDate.parse("2025-01-01"), 7.0);
        addRecommendationWatchlistItem(user, watch);

        Film candidateComplete = saveFilmWithEnrichmentStatus(200L, "Cand A", "en", 8.0, FilmEnrichmentStatus.DONE);
        Film candidatePartial  = saveFilmWithEnrichmentStatus(201L, "Cand B", "en", 6.0, FilmEnrichmentStatus.DONE);

        linkRecommendation(watch, candidateComplete);
        linkRecommendation(watch, candidatePartial);

        Genre genre = Objects.requireNonNull(
                genreRepository.save(Objects.requireNonNull(
                        Genre.builder().genreId(10L).name("Action").type(FilmType.MOVIE).build(),
                        "genre"
                )),
                "savedGenre"
        );
        genre.getFilms().add(watch);
        genre.getFilms().add(candidateComplete);
        genreRepository.saveAndFlush(genre);

        Keyword keyword = Objects.requireNonNull(
                keywordRepository.save(Objects.requireNonNull(
                        Keyword.builder().keywordId(99L).name("Spy").type(FilmType.MOVIE).build(),
                        "keyword"
                )),
                "savedKeyword"
        );
        keyword.getFilms().add(watch);
        keyword.getFilms().add(candidateComplete);
        keywordRepository.saveAndFlush(keyword);

        Role directorRole = Objects.requireNonNull(roleRepository.save(Objects.requireNonNull(Role.builder()
                .roleCode("DIRECTOR")
                .roleName("Director")
                .roleGroup(RoleGroup.CREW)
                .build(), "directorRole")), "savedDirectorRole");
        Credit director = Objects.requireNonNull(creditRepository.save(Objects.requireNonNull(
                Credit.builder().creditsId(500L).name("Jane Director").build(),
                "directorCredit"
        )), "savedDirectorCredit");

        filmRoleRepository.save(Objects.requireNonNull(FilmRole.builder()
                .film(watch)
                .credit(director)
                .role(directorRole)
                .build(), "watchRole"));
        filmRoleRepository.save(Objects.requireNonNull(FilmRole.builder()
                .film(candidateComplete)
                .credit(director)
                .role(directorRole)
                .build(), "candidateRole"));

        recommendationSnapshotRecomputeService.recomputeSnapshotForUser(user.getId());

        List<RecommendationResultDTO> results = recommendationSnapshotQueryService.getRecommendationsForUser(user);
        assertThat(results).extracting("filmId")
                .contains(candidateComplete.getFilmId(), candidatePartial.getFilmId());

        RecommendationResultDTO partial = results.stream()
                .filter(r -> r.filmId().equals(candidatePartial.getFilmId()))
                .findFirst()
                .orElseThrow();

        assertThat(partial.keywordScore()).isEqualTo(0.0);
        assertThat(partial.genreScore()).isEqualTo(0.0);
        assertThat(partial.directorScore()).isEqualTo(0.0);
    }

    @Test
    @Order(26)
    @DisplayName("Recommendation snapshot recompute keeps only top K candidates in pass 2")
    void recompute_onlyKeepsTopKCandidatesForPass2() {
        User user = createRecommendationUserWithWatchlist("rec-topk");

        int originalTopK = (int) ReflectionTestUtils.getField(candidatePassFilter, "pass2TopK");
        try {
            ReflectionTestUtils.setField(candidatePassFilter, "pass2TopK", 1);

            Film watch = saveRecommendationFilm(300L, FilmType.MOVIE, "Watch", "en", LocalDate.parse("2025-01-01"), 7.0);
            addRecommendationWatchlistItem(user, watch);

            // Both DONE so pickEnrichedSurvivors can see them; English one scores higher
            Film bestByPass1  = saveFilmWithEnrichmentStatus(400L, "Best",  "en", 7.5, FilmEnrichmentStatus.DONE);
            Film worseByPass1 = saveFilmWithEnrichmentStatus(401L, "Worse", "fr", 9.9, FilmEnrichmentStatus.DONE);

            linkRecommendation(watch, bestByPass1);
            linkRecommendation(watch, worseByPass1);

            recommendationSnapshotRecomputeService.recomputeSnapshotForUser(user.getId());

            List<RecommendationResultDTO> results = recommendationSnapshotQueryService.getRecommendationsForUser(user);
            assertThat(results).extracting("filmId")
                    .containsExactly(bestByPass1.getFilmId());
        } finally {
            ReflectionTestUtils.setField(candidatePassFilter, "pass2TopK", originalTopK);
        }
    }

    @Test
    @Order(27)
    @DisplayName("Phase 3 enrichment keeps new films pending, defers on active lease, and reclaims after lease expiry")
    void phase3Enrichment_pendingCreationLeaseDeferralAndLeaseExpiryReclaim() {
        reset(tmdbClient);
        syncTaskRepository.deleteAll();

        long tmdbId = 990_001L;

        TmdbFilmResponse details = new TmdbFilmResponse();
        details.setId(tmdbId);
        details.setTitle("Phase 3 Source");
        details.setVoteAverage(7.7d);
        details.setReleaseDate("2025-01-15");
        details.setBackdropPath("/phase3.jpg");
        details.setOriginalLanguage("en");
        when(tmdbClient.fetchFilmDetails(tmdbId, FilmType.MOVIE)).thenReturn(details);
        when(tmdbClient.fetchCredits(tmdbId, FilmType.MOVIE)).thenReturn(new TmdbCreditsResponse());

        Film created = filmService.getOrCreateFilm(tmdbId, FilmType.MOVIE);
        assertThat(created.getEnrichmentStatus()).isEqualTo(FilmEnrichmentStatus.PENDING);
        assertThat(created.getLeaseExpiresAt()).isNull();
        assertThat(created.getEnrichedAt()).isNull();

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            Film locked = filmRepository.findById(created.getInternalId()).orElseThrow();
            locked.setKeywordSyncCompleted(true);
            locked.setGenreSyncCompleted(true);
            locked.setEnrichmentStatus(FilmEnrichmentStatus.IN_PROGRESS);
            locked.setLeaseExpiresAt(Instant.now().plusSeconds(60));
        });

        Film lockedSnapshot = filmRepository.findById(created.getInternalId()).orElseThrow();
        Film preparedLockedFilm = filmEnrichmentStateService.prepareFilm(lockedSnapshot);
        assertThat(filmEnrichmentStateService.tryAcquireLease(preparedLockedFilm)).isFalse();

        SyncAttemptResult deferred = filmSyncTaskService.syncNowOrQueue(lockedSnapshot, tmdbId, SyncCategory.ENRICHMENT);
        SyncTask queuedTask = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(created.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseThrow();

        assertThat(deferred.syncSucceeded()).isFalse();
        assertThat(deferred.retryScheduled()).isTrue();
        assertThat(deferred.errorCode()).isEqualTo("ENRICHMENT_LEASE_HELD");
        assertThat(queuedTask.getStatus()).isEqualTo(SyncTaskStatus.PENDING);
        assertThat(queuedTask.getAttempts()).isEqualTo(0);

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            Film expiredLeaseFilm = filmRepository.findById(created.getInternalId()).orElseThrow();
            expiredLeaseFilm.setLeaseExpiresAt(Instant.now().minusSeconds(5));
        });

        filmSyncTaskService.processTask(queuedTask.getId());

        Film enriched = filmRepository.findById(created.getInternalId()).orElseThrow();
        SyncTask completedTask = syncTaskRepository.findById(queuedTask.getId()).orElseThrow();

        assertThat(enriched.getCreditsSyncCompleted()).isTrue();
        assertThat(enriched.getKeywordSyncCompleted()).isTrue();
        assertThat(enriched.getGenreSyncCompleted()).isTrue();
        assertThat(enriched.getEnrichmentStatus()).isEqualTo(FilmEnrichmentStatus.DONE);
        assertThat(enriched.getLeaseExpiresAt()).isNull();
        assertThat(enriched.getEnrichedAt()).isNotNull();
        assertThat(completedTask.getStatus()).isEqualTo(SyncTaskStatus.SUCCEEDED);
        assertThat(completedTask.getLastErrorCode()).isNull();
    }

    private User createUserWithWatchlist(String prefix) {
        String suffix = prefix + "-" + System.nanoTime();
        User user = User.builder()
                .username(suffix)
                .email(suffix + "@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();

        user.setWatchlist(new Watchlist());
        return userRepository.saveAndFlush(user);
    }

    private User createRecommendationUserWithWatchlist(String prefix) {
        return createUserWithWatchlist(prefix);
    }

    private Film saveRecommendationFilm(Long tmdbId, FilmType type, String title, String language, LocalDate date, double rating) {
        Film film = Film.builder()
                .filmId(tmdbId)
                .type(type)
                .title(title)
                .originalLanguage(language)
                .date(date)
                .rating(rating)
                .backgroundImg("/b.jpg")
                .build();
        return filmRepository.saveAndFlush(film);
    }

    private void addRecommendationWatchlistItem(User user, Film film) {
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId()).orElseThrow();
        watchlistItemRepository.saveAndFlush(WatchlistItem.builder()
                .id(new WatchlistItemId(watchlist.getUserId(), film.getInternalId()))
                .watchlist(watchlist)
                .film(film)
                .build());
    }

    private void linkRecommendation(Film source, Film candidate) {
        recommendationRepository.saveAndFlush(Recommendation.builder()
                .id(new RecommendationId(source.getInternalId(), candidate.getInternalId()))
                .build());
    }

    // =========================================================================
    // Recommendation Engine — targeted behavioural tests
    // =========================================================================

    /**
     * pickEnrichedSurvivors must exclude non-DONE films so the final snapshot
     * only ever contains films with full metadata.
     */
    @Test
    @Order(28)
    @DisplayName("pickEnrichedSurvivors excludes PENDING and IN_PROGRESS candidates")
    void pickEnrichedSurvivors_excludesNonDoneCandidates() {
        User user = createUserWithWatchlist("pass-filter-enriched");

        Film watch = saveRecommendationFilm(2_800_001L, FilmType.MOVIE, "Watch", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        addRecommendationWatchlistItem(user, watch);

        Film done      = saveFilmWithEnrichmentStatus(2_800_010L, "Done Film",      "en", 8.0, FilmEnrichmentStatus.DONE);
        Film pending   = saveFilmWithEnrichmentStatus(2_800_011L, "Pending Film",   "en", 9.0, FilmEnrichmentStatus.PENDING);
        Film inProgress = saveFilmWithEnrichmentStatus(2_800_012L, "InProgress Film","en", 9.5, FilmEnrichmentStatus.IN_PROGRESS);

        linkRecommendation(watch, done);
        linkRecommendation(watch, pending);
        linkRecommendation(watch, inProgress);

        List<Long> watchlistIds  = candidatePassFilter.resolveWatchlistFilmIds(user.getId());
        Set<Long>  candidateIds  = candidatePassFilter.resolveCandidateFilmIds(watchlistIds);
        List<Long> survivors     = candidatePassFilter.pickEnrichedSurvivors(watchlistIds, candidateIds);

        assertThat(survivors).containsExactly(done.getInternalId());
        assertThat(survivors).doesNotContain(pending.getInternalId(), inProgress.getInternalId());
    }

    /**
     * pickEnrichmentCandidates must include ALL statuses so that placeholder
     * films (PENDING/IN_PROGRESS) can be scheduled for enrichment.
     */
    @Test
    @Order(29)
    @DisplayName("pickEnrichmentCandidates includes PENDING and IN_PROGRESS candidates")
    void pickEnrichmentCandidates_includesNonDoneCandidates() {
        User user = createUserWithWatchlist("pass-filter-all");

        Film watch = saveRecommendationFilm(2_900_001L, FilmType.MOVIE, "Watch", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        addRecommendationWatchlistItem(user, watch);

        Film done       = saveFilmWithEnrichmentStatus(2_900_010L, "Done",        "en", 7.0, FilmEnrichmentStatus.DONE);
        Film pending    = saveFilmWithEnrichmentStatus(2_900_011L, "Pending",     "en", 8.0, FilmEnrichmentStatus.PENDING);
        Film inProgress = saveFilmWithEnrichmentStatus(2_900_012L, "InProgress",  "en", 9.0, FilmEnrichmentStatus.IN_PROGRESS);

        linkRecommendation(watch, done);
        linkRecommendation(watch, pending);
        linkRecommendation(watch, inProgress);

        List<Long> watchlistIds = candidatePassFilter.resolveWatchlistFilmIds(user.getId());
        Set<Long>  candidateIds = candidatePassFilter.resolveCandidateFilmIds(watchlistIds);
        List<Long> survivors    = candidatePassFilter.pickEnrichmentCandidates(watchlistIds, candidateIds);

        assertThat(survivors)
                .containsExactlyInAnyOrder(done.getInternalId(), pending.getInternalId(), inProgress.getInternalId());
    }

    /**
     * resolveCandidateFilmIds must never return a film that is already in the
     * user's watchlist, even if the recommendation graph has an edge to it.
     */
    @Test
    @Order(30)
    @DisplayName("resolveCandidateFilmIds excludes films already in the watchlist")
    void resolveCandidateFilmIds_excludesWatchlistFilms() {
        User user = createUserWithWatchlist("resolve-no-watchlist");

        Film watchA = saveRecommendationFilm(3_000_001L, FilmType.MOVIE, "WatchA", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        Film watchB = saveRecommendationFilm(3_000_002L, FilmType.MOVIE, "WatchB", "en",
                LocalDate.parse("2025-02-01"), 7.5);
        Film external = saveRecommendationFilm(3_000_003L, FilmType.MOVIE, "External", "en",
                LocalDate.parse("2025-03-01"), 8.0);

        addRecommendationWatchlistItem(user, watchA);
        addRecommendationWatchlistItem(user, watchB);

        // watchA recommends watchB (already in watchlist) and external
        linkRecommendation(watchA, watchB);
        linkRecommendation(watchA, external);

        List<Long> watchlistIds = candidatePassFilter.resolveWatchlistFilmIds(user.getId());
        Set<Long>  candidateIds = candidatePassFilter.resolveCandidateFilmIds(watchlistIds);

        assertThat(candidateIds).containsExactly(external.getInternalId());
        assertThat(candidateIds).doesNotContain(watchA.getInternalId(), watchB.getInternalId());
    }

    /**
     * Pass-1 score = language_match * 1.0 + rating * 0.01 + recency_boost.
     * A language-matching candidate with a modest rating must rank above a
     * non-matching one with a higher rating.
     */
    @Test
    @Order(31)
    @DisplayName("Pass-1 ordering: language-matching candidate ranks above higher-rated foreign-language one")
    void pass1Ordering_languageMatchBeatsHigherRatingWithoutMatch() {
        User user = createUserWithWatchlist("pass1-order");

        Film watch = saveRecommendationFilm(3_100_001L, FilmType.MOVIE, "Watch", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        addRecommendationWatchlistItem(user, watch);

        // English / lower rating (score ≈ 1.0 + 0.07 = 1.07)
        Film englishLow = saveFilmWithEnrichmentStatus(3_100_010L, "EN Low",  "en", 7.0, FilmEnrichmentStatus.DONE);
        // French / higher rating (score ≈ 0.0 + 0.09 = 0.09)
        Film frenchHigh = saveFilmWithEnrichmentStatus(3_100_011L, "FR High", "fr", 9.0, FilmEnrichmentStatus.DONE);

        linkRecommendation(watch, englishLow);
        linkRecommendation(watch, frenchHigh);

        int originalTopK = (int) ReflectionTestUtils.getField(candidatePassFilter, "pass2TopK");
        try {
            ReflectionTestUtils.setField(candidatePassFilter, "pass2TopK", 10);
            List<Long> watchlistIds = candidatePassFilter.resolveWatchlistFilmIds(user.getId());
            Set<Long>  candidateIds = candidatePassFilter.resolveCandidateFilmIds(watchlistIds);
            List<Long> survivors    = candidatePassFilter.pickEnrichedSurvivors(watchlistIds, candidateIds);

            assertThat(survivors).first().isEqualTo(englishLow.getInternalId());
        } finally {
            ReflectionTestUtils.setField(candidatePassFilter, "pass2TopK", originalTopK);
        }
    }

    /**
     * The recompute snapshot must NOT include non-DONE films, because
     * pickEnrichedSurvivors gates the full scoring pipeline.
     */
    @Test
    @Order(32)
    @DisplayName("Recompute snapshot excludes non-enriched (PENDING) candidates entirely")
    void recomputeSnapshot_excludesPendingCandidates() {
        User user = createUserWithWatchlist("recompute-no-pending");

        Film watch = saveRecommendationFilm(3_200_001L, FilmType.MOVIE, "Watch", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        addRecommendationWatchlistItem(user, watch);

        Film done    = saveFilmWithEnrichmentStatus(3_200_010L, "Done",    "en", 8.0, FilmEnrichmentStatus.DONE);
        Film pending = saveFilmWithEnrichmentStatus(3_200_011L, "Pending", "en", 9.5, FilmEnrichmentStatus.PENDING);

        linkRecommendation(watch, done);
        linkRecommendation(watch, pending);

        recommendationSnapshotRecomputeService.recomputeSnapshotForUser(user.getId());

        List<RecommendationResultDTO> results = recommendationSnapshotQueryService.getRecommendationsForUser(user);
        List<Long> filmIds = results.stream().map(RecommendationResultDTO::filmId).toList();

        assertThat(filmIds).contains(done.getFilmId());
        assertThat(filmIds).doesNotContain(pending.getFilmId());
    }

    /**
     * When a film transitions to DONE, EnrichmentSyncTaskHandler must schedule
     * a recompute task for every user whose watchlist contains a source film
     * that recommended the newly enriched film.
     */
    @Test
    @Order(33)
    @DisplayName("EnrichmentSyncTaskHandler schedules ENRICHMENT_COMPLETE recompute for affected users when film becomes DONE")
    void enrichmentHandler_scheduleRecomputeForAffectedUsers_whenFilmBecomeDone() {
        userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();

        // Two users with different watchlist source films, both pointing at the same candidate
        User userA = createUserWithWatchlist("enrich-trigger-A");
        User userB = createUserWithWatchlist("enrich-trigger-B");

        Film sourceA   = saveRecommendationFilm(3_300_001L, FilmType.MOVIE, "SourceA", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        Film sourceB   = saveRecommendationFilm(3_300_002L, FilmType.MOVIE, "SourceB", "en",
                LocalDate.parse("2025-01-01"), 7.0);
        Film candidate = saveFilmWithEnrichmentStatus(3_300_010L, "Candidate", "en", 8.0,
                FilmEnrichmentStatus.PENDING);

        addRecommendationWatchlistItem(userA, sourceA);
        addRecommendationWatchlistItem(userB, sourceB);
        linkRecommendation(sourceA, candidate);
        linkRecommendation(sourceB, candidate);

        // Simulate enrichment completing: flip status to DONE
        candidate.setEnrichmentStatus(FilmEnrichmentStatus.DONE);
        candidate.setGenreSyncCompleted(true);
        candidate.setKeywordSyncCompleted(true);
        candidate.setCreditsSyncCompleted(true);
        candidate.setEnrichedAt(Instant.now());
        candidate.setLeaseExpiresAt(null);
        filmRepository.saveAndFlush(candidate);

        // Invoke afterSyncSuccess with userId = null (the handler resolves users from the graph)
        filmSyncTaskService.syncNowOrQueue(candidate, candidate.getFilmId(), SyncCategory.ENRICHMENT);

        // Both users should have a recompute task scheduled with ENRICHMENT_COMPLETE
        assertThat(userRecomputeTaskRepository.findById(userA.getId()))
                .isPresent()
                .hasValueSatisfying(task ->
                        assertThat(task.getTriggeredBy())
                                .isEqualTo(RecommendationRecomputeTriggeredBy.ENRICHMENT_COMPLETE));

        assertThat(userRecomputeTaskRepository.findById(userB.getId()))
                .isPresent()
                .hasValueSatisfying(task ->
                        assertThat(task.getTriggeredBy())
                                .isEqualTo(RecommendationRecomputeTriggeredBy.ENRICHMENT_COMPLETE));
    }

    /**
     * When a film completes enrichment but is NOT recommended by any source film
     * in any user's watchlist, no recompute task must be created.
     */
    @Test
    @Order(34)
    @DisplayName("EnrichmentSyncTaskHandler does NOT schedule recompute when enriched film has no watchlist-connected source films")
    void enrichmentHandler_doesNotScheduleRecompute_whenNoAffectedUsers() {
        userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();
        reset(tmdbClient);

        // Isolated film: not recommended by anything in any watchlist
        long isolatedTmdbId = 3_400_010L;
        TmdbFilmResponse details = new TmdbFilmResponse();
        details.setId(isolatedTmdbId);
        details.setTitle("Isolated");
        details.setVoteAverage(8.0d);
        details.setReleaseDate("2025-01-01");
        details.setBackdropPath("/iso.jpg");
        details.setOriginalLanguage("en");
        when(tmdbClient.fetchFilmDetails(isolatedTmdbId, FilmType.MOVIE)).thenReturn(details);
        when(tmdbClient.fetchCredits(isolatedTmdbId, FilmType.MOVIE)).thenReturn(new TmdbCreditsResponse());

        Film isolated = filmService.getOrCreateFilm(isolatedTmdbId, FilmType.MOVIE);

        // Enrich it: no recommendation edges → no users → no recompute task
        filmSyncTaskService.syncNowOrQueue(isolated, isolatedTmdbId, SyncCategory.ENRICHMENT);

        // No user should receive a recompute task
        assertThat(userRecomputeTaskRepository.count()).isZero();
    }

    /**
     * afterSyncSuccess in RecommendationSyncTaskHandler must skip scheduling a
     * recompute when the enriched-survivor count is below the configured threshold.
     * Enrichment tasks must still be enqueued for the survivors.
     */
    @Test
    @Order(35)
    @DisplayName("RecommendationSyncTaskHandler skips recompute when enriched survivors < threshold, but still enqueues enrichment tasks")
    void recommendationSyncHandler_skipsRecompute_whenEnrichedSurvivorsBelow_threshold() {
        userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();

        User user = createUserWithWatchlist("rec-sync-below-threshold");

        // Source film already recommendation-synced so syncNowOrQueue takes the
        // alreadySynced → afterSyncSuccess path without wiping the pre-linked edges.
        Film source = filmRepository.saveAndFlush(Film.builder()
                .filmId(3_500_001L).type(FilmType.MOVIE).title("Source")
                .originalLanguage("en").date(LocalDate.parse("2025-01-01")).rating(7.0)
                .backgroundImg("/bg.jpg").recommendationSyncCompleted(true).build());
        addRecommendationWatchlistItem(user, source);

        // One DONE, two PENDING → enriched count (1) < default threshold (3)
        Film done1 = saveFilmWithEnrichmentStatus(3_500_010L, "Done1",    "en", 8.0, FilmEnrichmentStatus.DONE);
        Film pend1 = saveFilmWithEnrichmentStatus(3_500_011L, "Pending1", "en", 7.5, FilmEnrichmentStatus.PENDING);
        Film pend2 = saveFilmWithEnrichmentStatus(3_500_012L, "Pending2", "en", 7.0, FilmEnrichmentStatus.PENDING);

        linkRecommendation(source, done1);
        linkRecommendation(source, pend1);
        linkRecommendation(source, pend2);

        // Already-synced path: afterSyncSuccess fires, no TMDB call needed.
        filmSyncTaskService.syncNowOrQueue(source, source.getFilmId(), SyncCategory.RECOMMENDATION, user.getId());

        // No recompute: enriched survivor count (1) < threshold (3)
        assertThat(userRecomputeTaskRepository.findById(user.getId())).isEmpty();

        // Enrichment tasks enqueued for PENDING survivors (pend1, pend2); done1 skipped
        long enrichmentTaskCount = syncTaskRepository.findAll().stream()
                .filter(t -> t.getSyncCategory() == SyncCategory.ENRICHMENT)
                .count();
        assertThat(enrichmentTaskCount).isGreaterThanOrEqualTo(1);
    }

    @Test
    @Order(36)
    @DisplayName("RecommendationSyncTaskHandler schedules recompute when enriched survivors >= threshold")
    void recommendationSyncHandler_schedulesRecompute_whenEnrichedSurvivorsAtOrAbove_threshold() {
        userRecomputeTaskRepository.deleteAll();
        syncTaskRepository.deleteAll();

        User user = createUserWithWatchlist("rec-sync-above-threshold");

        // Source already synced so afterSyncSuccess fires without wiping edges
        Film source = filmRepository.saveAndFlush(Film.builder()
                .filmId(3_600_001L).type(FilmType.MOVIE).title("Source")
                .originalLanguage("en").date(LocalDate.parse("2025-01-01")).rating(7.0)
                .backgroundImg("/bg.jpg").recommendationSyncCompleted(true).build());
        addRecommendationWatchlistItem(user, source);

        // Three DONE candidates → enriched count (3) >= default threshold (3)
        Film done1 = saveFilmWithEnrichmentStatus(3_600_010L, "Done1", "en", 8.0, FilmEnrichmentStatus.DONE);
        Film done2 = saveFilmWithEnrichmentStatus(3_600_011L, "Done2", "en", 8.1, FilmEnrichmentStatus.DONE);
        Film done3 = saveFilmWithEnrichmentStatus(3_600_012L, "Done3", "en", 8.2, FilmEnrichmentStatus.DONE);

        linkRecommendation(source, done1);
        linkRecommendation(source, done2);
        linkRecommendation(source, done3);

        filmSyncTaskService.syncNowOrQueue(source, source.getFilmId(), SyncCategory.RECOMMENDATION, user.getId());

        assertThat(userRecomputeTaskRepository.findById(user.getId()))
                .isPresent()
                .hasValueSatisfying(task ->
                        assertThat(task.getTriggeredBy())
                                .isEqualTo(RecommendationRecomputeTriggeredBy.RECOMMENDATION_SYNC_COMPLETE));
    }

    @Test
    @Order(37)
    @DisplayName("RecommendationSyncTaskHandler enqueues enrichment only for pass-2 survivors, not all candidates")
    void recommendationSyncHandler_enqueuesToEnrichment_onlyPassSurvivors() {
        syncTaskRepository.deleteAll();
        userRecomputeTaskRepository.deleteAll();

        User user = createUserWithWatchlist("enqueue-survivors-only");

        // Source already synced so edges are preserved
        Film source = filmRepository.saveAndFlush(Film.builder()
                .filmId(3_700_001L).type(FilmType.MOVIE).title("Source")
                .originalLanguage("en").date(LocalDate.parse("2025-01-01")).rating(7.0)
                .backgroundImg("/bg.jpg").recommendationSyncCompleted(true).build());
        addRecommendationWatchlistItem(user, source);

        // Limit pass2TopK to 1 so only the top scorer is eligible for enrichment
        int originalTopK = (int) ReflectionTestUtils.getField(candidatePassFilter, "pass2TopK");
        try {
            ReflectionTestUtils.setField(candidatePassFilter, "pass2TopK", 1);

            // English candidate scores higher (language match = 1.0) than French one (0.0)
            Film goodMatch = saveFilmWithEnrichmentStatus(3_700_010L, "GoodMatch", "en", 8.0, FilmEnrichmentStatus.PENDING);
            Film poorMatch = saveFilmWithEnrichmentStatus(3_700_011L, "PoorMatch", "fr", 7.0, FilmEnrichmentStatus.PENDING);

            linkRecommendation(source, goodMatch);
            linkRecommendation(source, poorMatch);

            filmSyncTaskService.syncNowOrQueue(source, source.getFilmId(), SyncCategory.RECOMMENDATION, user.getId());

            List<SyncTask> enrichmentTasks = syncTaskRepository.findAll().stream()
                    .filter(t -> t.getSyncCategory() == SyncCategory.ENRICHMENT)
                    .toList();

            // With top-k=1, only the highest-scoring survivor (English match) gets an enrichment task
            assertThat(enrichmentTasks).hasSize(1);
            assertThat(enrichmentTasks.get(0).getFilmInternalId()).isEqualTo(goodMatch.getInternalId());
        } finally {
            ReflectionTestUtils.setField(candidatePassFilter, "pass2TopK", originalTopK);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers for the new recommendation engine tests
    // -------------------------------------------------------------------------

    private Film saveFilmWithEnrichmentStatus(Long tmdbId, String title, String language,
            double rating, FilmEnrichmentStatus status) {
        Film film = Film.builder()
                .filmId(tmdbId)
                .type(FilmType.MOVIE)
                .title(title)
                .originalLanguage(language)
                .date(LocalDate.parse("2025-01-01"))
                .rating(rating)
                .backgroundImg("/bg.jpg")
                .enrichmentStatus(status)
                .genreSyncCompleted(status == FilmEnrichmentStatus.DONE)
                .keywordSyncCompleted(status == FilmEnrichmentStatus.DONE)
                .creditsSyncCompleted(status == FilmEnrichmentStatus.DONE)
                .enrichedAt(status == FilmEnrichmentStatus.DONE ? Instant.now() : null)
                .build();
        return filmRepository.saveAndFlush(film);
    }
}
