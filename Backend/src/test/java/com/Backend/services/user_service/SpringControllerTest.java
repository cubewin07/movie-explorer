package com.Backend.services.user_service;

import com.Backend.services.notification_service.model.NotificationDTO;
import com.Backend.services.notification_service.service.NotificationService;
import com.Backend.services.credit_service.model.Credit;
import com.Backend.services.credit_service.model.FilmRole;
import com.Backend.services.credit_service.model.Role;
import com.Backend.services.credit_service.model.RoleGroup;
import com.Backend.services.credit_service.model.UserCreditWeight;
import com.Backend.services.credit_service.model.UserCreditWeightId;
import com.Backend.services.credit_service.repository.CreditRepository;
import com.Backend.services.credit_service.repository.FilmRoleRepository;
import com.Backend.services.credit_service.repository.RoleRepository;
import com.Backend.services.credit_service.repository.UserCreditWeightRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.model.Genre;
import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.model.UserGenreWeightId;
import com.Backend.services.genre_service.repository.GenreRepository;
import com.Backend.services.genre_service.repository.UserGenreWeightRepository;
import com.Backend.services.keyword_service.model.Keyword;
import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.model.UserKeywordWeightId;
import com.Backend.services.keyword_service.repository.KeywordRepository;
import com.Backend.services.keyword_service.repository.UserKeywordWeightRepository;
import com.Backend.services.recommendation_service.model.Recommendation;
import com.Backend.services.recommendation_service.model.RecommendationId;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.model.DTO.UpdateUserDTO;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.UserFilmReference;
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.repository.UserFilmReferenceRepository;
import com.Backend.services.user_service.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
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
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.http.MediaType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;

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
        private UserFilmReferenceRepository userFilmReferenceRepository;

        @Autowired
        private UserCreditWeightRepository userCreditWeightRepository;

        @Autowired
        private UserGenreWeightRepository userGenreWeightRepository;

        @Autowired
        private UserKeywordWeightRepository userKeywordWeightRepository;

        @Autowired
        private PlatformTransactionManager transactionManager;

        @Autowired
        private MeterRegistry meterRegistry;

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
    @DisplayName("GET /recommendations ranks candidates by normalized weighted score and recency boost")
    void recommendations_ranked_by_weighted_normalized_score_with_recency_boost() throws Exception {
        String email = "recommend_logic_a@example.com";
        register("recommend_logic_a", email, "password123");
        String token = authenticate(email, "password123");
        Long userId = getUserId(token);

        long sourceTmdbId = 700001L;
        when(tmdbClient.fetchFilmDetails(sourceTmdbId, FilmType.MOVIE)).thenReturn(movieResponse(sourceTmdbId));
        addMovie(token, sourceTmdbId);
        Film sourceFilm = filmRepository.findByFilmIdAndType(sourceTmdbId, FilmType.MOVIE).orElseThrow();

        Film candidateFresh = filmRepository.save(Film.builder()
                .filmId(700002L)
                .type(FilmType.MOVIE)
                .title("Candidate Fresh")
                .rating(6.0)
                .date(LocalDate.now().minusDays(20))
                .backgroundImg("/candidate-fresh.jpg")
                .build());
        Film candidateOld = filmRepository.save(Film.builder()
                .filmId(700003L)
                .type(FilmType.MOVIE)
                .title("Candidate Old")
                .rating(9.0)
                .date(LocalDate.now().minusDays(900))
                .backgroundImg("/candidate-old.jpg")
                .build());

        Role directorRole = ensureRoleExists("DIRECTOR", "Director", RoleGroup.CREW);

        Credit directorLow = creditRepository.save(Credit.builder()
                .creditsId(710001L)
                .name("Director Low")
                .build());
        Credit directorHigh = creditRepository.save(Credit.builder()
                .creditsId(710002L)
                .name("Director High")
                .build());

        filmRoleRepository.save(FilmRole.builder()
                .film(candidateFresh)
                .credit(directorLow)
                .role(directorRole)
                .jobName("Director")
                .build());
        filmRoleRepository.save(FilmRole.builder()
                .film(candidateOld)
                .credit(directorHigh)
                .role(directorRole)
                .jobName("Director")
                .build());

        Genre genreHigh = Genre.builder().genreId(720001L).name("Genre High").type(FilmType.MOVIE).build();
        genreHigh.getFilms().add(candidateFresh);
        genreHigh = genreRepository.save(genreHigh);

        Genre genreLow = Genre.builder().genreId(720002L).name("Genre Low").type(FilmType.MOVIE).build();
        genreLow.getFilms().add(candidateOld);
        genreLow = genreRepository.save(genreLow);

        Keyword keywordHigh = Keyword.builder().keywordId(730001L).name("Keyword High").type(FilmType.MOVIE).build();
        keywordHigh.getFilms().add(candidateFresh);
        keywordHigh = keywordRepository.save(keywordHigh);

        Keyword keywordLow = Keyword.builder().keywordId(730002L).name("Keyword Low").type(FilmType.MOVIE).build();
        keywordLow.getFilms().add(candidateOld);
        keywordLow = keywordRepository.save(keywordLow);

        User persistedUser = userRepository.findById(userId).orElseThrow();
        UserFilmReference userReference = userFilmReferenceRepository.save(UserFilmReference.builder()
                .userId(userId)
                .user(persistedUser)
                .build());

        userCreditWeightRepository.save(UserCreditWeight.builder()
                .id(new UserCreditWeightId(userId, directorLow.getCreditsId(), directorRole.getRoleId()))
                .userReference(userReference)
                .credit(directorLow)
                .role(directorRole)
                .weight(1L)
                .build());
        userCreditWeightRepository.save(UserCreditWeight.builder()
                .id(new UserCreditWeightId(userId, directorHigh.getCreditsId(), directorRole.getRoleId()))
                .userReference(userReference)
                .credit(directorHigh)
                .role(directorRole)
                .weight(9L)
                .build());

        userGenreWeightRepository.save(UserGenreWeight.builder()
                .id(new UserGenreWeightId(userId, genreHigh.getGenreId()))
                .userReference(userReference)
                .genre(genreHigh)
                .type(FilmType.MOVIE)
                .weight(8L)
                .build());
        userGenreWeightRepository.save(UserGenreWeight.builder()
                .id(new UserGenreWeightId(userId, genreLow.getGenreId()))
                .userReference(userReference)
                .genre(genreLow)
                .type(FilmType.MOVIE)
                .weight(1L)
                .build());

        userKeywordWeightRepository.save(UserKeywordWeight.builder()
                .id(new UserKeywordWeightId(userId, keywordHigh.getKeywordId()))
                .userReference(userReference)
                .keyword(keywordHigh)
                .type(FilmType.MOVIE)
                .weight(10L)
                .build());
        userKeywordWeightRepository.save(UserKeywordWeight.builder()
                .id(new UserKeywordWeightId(userId, keywordLow.getKeywordId()))
                .userReference(userReference)
                .keyword(keywordLow)
                .type(FilmType.MOVIE)
                .weight(1L)
                .build());

        recommendationRepository.save(Recommendation.builder()
                .id(new RecommendationId(sourceFilm.getInternalId(), candidateFresh.getInternalId()))
                .build());
        recommendationRepository.save(Recommendation.builder()
                .id(new RecommendationId(sourceFilm.getInternalId(), candidateOld.getInternalId()))
                .build());
        recommendationRepository.save(Recommendation.builder()
                .id(new RecommendationId(sourceFilm.getInternalId(), sourceFilm.getInternalId()))
                .build());

        MvcResult result = mockMvc.perform(get("/recommendations")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andReturn();

        List<Map<String, Object>> ranked = objectMapper.readValue(result.getResponse().getContentAsString(), List.class);
        assertThat(ranked).hasSize(2);

        Number topId = (Number) ranked.get(0).get("internalFilmId");
        Number secondId = (Number) ranked.get(1).get("internalFilmId");
        assertThat(topId.longValue()).isEqualTo(candidateFresh.getInternalId());
        assertThat(secondId.longValue()).isEqualTo(candidateOld.getInternalId());

        double topScore = ((Number) ranked.get(0).get("score")).doubleValue();
        double secondScore = ((Number) ranked.get(1).get("score")).doubleValue();
        assertThat(topScore).isGreaterThan(secondScore);

        double topKeyword = ((Number) ranked.get(0).get("keywordScore")).doubleValue();
        double topGenre = ((Number) ranked.get(0).get("genreScore")).doubleValue();
        double topDirector = ((Number) ranked.get(0).get("directorScore")).doubleValue();
        double topRating = ((Number) ranked.get(0).get("ratingScore")).doubleValue();
        double topBoost = ((Number) ranked.get(0).get("recencyBoost")).doubleValue();

        assertThat(topKeyword).isCloseTo(10.0, within(0.0001));
        assertThat(topGenre).isCloseTo(10.0, within(0.0001));
        assertThat(topDirector).isCloseTo(0.0, within(0.0001));
        assertThat(topRating).isCloseTo(0.0, within(0.0001));
        assertThat(topBoost).isGreaterThan(0.0);

        double secondBoost = ((Number) ranked.get(1).get("recencyBoost")).doubleValue();
        assertThat(secondBoost).isCloseTo(0.0, within(0.0001));

        List<Long> returnedIds = ranked.stream()
                .map(row -> ((Number) row.get("internalFilmId")).longValue())
                .toList();
        assertThat(returnedIds).doesNotContain(sourceFilm.getInternalId());

        Timer recommendationLatency = meterRegistry.find("recommendation.endpoint.latency")
                .tag("endpoint", "get_recommendations")
                .tag("outcome", "success")
                .timer();
        assertThat(recommendationLatency).isNotNull();
        assertThat(recommendationLatency.count()).isGreaterThan(0);
    }

    @Test
    @Order(23)
    @DisplayName("GET /recommendations returns empty list when user has no candidate links")
    void recommendations_empty_when_no_candidate_links() throws Exception {
        String email = "recommend_logic_empty@example.com";
        register("recommend_logic_empty", email, "password123");
        String token = authenticate(email, "password123");

        long sourceTmdbId = 700101L;
        when(tmdbClient.fetchFilmDetails(sourceTmdbId, FilmType.MOVIE)).thenReturn(movieResponse(sourceTmdbId));
        addMovie(token, sourceTmdbId);

        mockMvc.perform(get("/recommendations")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @Order(24)
    @DisplayName("Anonymous GET /recommendations/similar returns similar items without auth")
    void anonymous_getSimilar_returnsItems_without_authentication() throws Exception {
        long filmId = 880001L;
        List<TmdbSimilarItem> similarItems = List.of(
                new TmdbSimilarItem(880002L, "Similar Movie A", "2022-04-12", "/similar-a.jpg"),
                new TmdbSimilarItem(880003L, "Similar Movie B", "2020-07-09", "/similar-b.jpg")
        );

        when(tmdbClient.fetchSimilar(filmId, FilmType.MOVIE)).thenReturn(similarItems);

        mockMvc.perform(get("/recommendations/similar")
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].tmdbId").value(880002L))
                .andExpect(jsonPath("$[0].title").value("Similar Movie A"))
                .andExpect(jsonPath("$[0].dateValue").value("2022-04-12"))
                .andExpect(jsonPath("$[0].backgroundImg").value("/similar-a.jpg"));
    }

        @Test
        @Order(25)
        @DisplayName("Concurrent credit weight add/remove keeps expected net weight")
        void concurrent_credit_weight_add_remove_keeps_expected_net_weight() throws Exception {
                String email = "concurrency_credit@example.com";
                register("concurrency_credit", email, "password123");
                String token = authenticate(email, "password123");
                Long userId = getUserId(token);

                UserFilmReference userReference = userFilmReferenceRepository.findById(userId).orElseThrow();

                long creditId = 900_000L + ThreadLocalRandom.current().nextLong(10_000L);
                Credit credit = creditRepository.saveAndFlush(Credit.builder()
                                .creditsId(creditId)
                                .name("Concurrent Credit")
                                .department("Acting")
                                .build());

                String roleCode = "ROLE_CONC_" + System.nanoTime();
                Role role = roleRepository.saveAndFlush(Role.builder()
                                .roleCode(roleCode)
                                .roleName("Actor")
                                .roleGroup(RoleGroup.CAST)
                                .build());

                int baselineWeight = 1_000;
                UserCreditWeightId weightId = new UserCreditWeightId(userId, credit.getCreditsId(), role.getRoleId());
                userCreditWeightRepository.saveAndFlush(UserCreditWeight.builder()
                                .id(weightId)
                                .userReference(userReference)
                                .credit(credit)
                                .role(role)
                                .weight((long) baselineWeight)
                                .build());

                int pairs = 250;
                int totalOperations = pairs * 2;

                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                ExecutorService pool = Executors.newFixedThreadPool(16);
                CountDownLatch done = new CountDownLatch(totalOperations);
                AtomicReference<Throwable> failure = new AtomicReference<>();

                for (int i = 0; i < pairs; i++) {
                        pool.submit(() -> applyConcurrentCreditWeightDelta(
                                        transactionTemplate,
                                        userId,
                                        credit.getCreditsId(),
                                        role.getRoleId(),
                                        1L,
                                        done,
                                        failure
                        ));
                        pool.submit(() -> applyConcurrentCreditWeightDelta(
                                        transactionTemplate,
                                        userId,
                                        credit.getCreditsId(),
                                        role.getRoleId(),
                                        -1L,
                                        done,
                                        failure
                        ));
                }

                assertThat(done.await(90, TimeUnit.SECONDS)).isTrue();
                pool.shutdown();
                assertThat(pool.awaitTermination(15, TimeUnit.SECONDS)).isTrue();

                if (failure.get() != null) {
                        fail("Concurrent weight adjustment failed", failure.get());
                }

                Long finalWeight = userCreditWeightRepository.findById(weightId)
                                .map(UserCreditWeight::getWeight)
                                .orElse(null);
                assertThat(finalWeight).isEqualTo((long) baselineWeight);
        }

        private void applyConcurrentCreditWeightDelta(
                        TransactionTemplate transactionTemplate,
                        Long userId,
                        Long creditId,
                        Long roleId,
                        long delta,
                        CountDownLatch done,
                        AtomicReference<Throwable> failure
        ) {
                try {
                        transactionTemplate.executeWithoutResult(status -> {
                                int updated = userCreditWeightRepository.incrementWeight(userId, creditId, roleId, delta);
                                if (updated == 0 && delta <= 0) {
                                        return;
                                }

                                if (updated == 0) {
                                        int inserted = userCreditWeightRepository.insertIfAbsent(userId, creditId, roleId, delta);
                                        if (inserted == 0) {
                                                userCreditWeightRepository.incrementWeight(userId, creditId, roleId, delta);
                                        }
                                }

                                userCreditWeightRepository.deleteIfNonPositive(userId, creditId, roleId);
                        });
                } catch (Throwable ex) {
                        failure.compareAndSet(null, ex);
                } finally {
                        done.countDown();
                }
        }
}
