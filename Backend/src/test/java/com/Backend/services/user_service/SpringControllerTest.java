package com.Backend.services.user_service;

import com.Backend.services.notification_service.model.NotificationDTO;
import com.Backend.services.notification_service.service.NotificationService;
import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.model.DTO.UpdateUserDTO;
import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
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
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@EnableCaching
class SpringControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationService notificationService;

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
    
    @Test
    @Order(1)
    @DisplayName("GET /user/all returns list of users")
    void getAllUsers_returnsOk() throws Exception {
        // Register two users
        register("john", "john@example.com", "password123");
        register("jane", "jane@example.com", "password123");
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
        
        // Initially empty
        mockMvc.perform(get("/watchlist")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.moviesId", hasSize(0)))
        .andExpect(jsonPath("$.seriesId", hasSize(0)));
        
        // Add movie and series
        addMovie(token, 101L);
        addSeries(token, 202L);
        
        mockMvc.perform(get("/watchlist")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.moviesId", contains(101)))
        .andExpect(jsonPath("$.seriesId", contains(202)));
        
        // Remove them
        removeMovie(token, 101L);
        removeSeries(token, 202L);
        
        mockMvc.perform(get("/watchlist")
        .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.moviesId", not(hasItem(101))))
        .andExpect(jsonPath("$.seriesId", not(hasItem(202))));
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
                .andExpect(jsonPath("$[?(@.id==%s)].content", reviewId).value(hasItem("Amazing movie!")))
                .andExpect(jsonPath("$[?(@.id==%s)].score", reviewId).value(hasItem(1)))
                .andExpect(jsonPath("$[?(@.id==%s)].user.email", reviewId).value(hasItem(email)));
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
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content", is("This is a reply")))
                .andExpect(jsonPath("$[0].score", is(1)));

        // Parent replyCount should be 1 when fetching by film
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(token))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==%s)].replyCount", parentId).value(hasItem(1)));
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
                .andExpect(jsonPath("$[*].id", not(hasItem(reviewId))));

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
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

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
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(true)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

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
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(true)));

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
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

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
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));

        // Author should still see their own auto-like
        mockMvc.perform(get("/reviews")
                        .header("Authorization", bearer(authorToken))
                        .param("filmId", String.valueOf(filmId))
                        .param("type", FilmType.MOVIE.name())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(true)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));
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
                .andExpect(jsonPath("$[?(@.id==%s)].content", reviewId).value(hasItem("Anon visible review")))
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", reviewId).value(hasItem(false)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", reviewId).value(hasItem(false)));
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
                .andExpect(jsonPath("$[*].id", hasItem(replyId)))
                .andExpect(jsonPath("$[?(@.id==%s)].content", replyId).value(hasItem("Reply shown to anonymous")))
                .andExpect(jsonPath("$[?(@.id==%s)].likedByMe", replyId).value(hasItem(false)))
                .andExpect(jsonPath("$[?(@.id==%s)].disLikedByMe", replyId).value(hasItem(false)));
    }
}