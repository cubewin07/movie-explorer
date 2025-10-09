package com.Backend.services.user_service;

import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.model.DTO.UpdateUserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.model.WatchlistType;
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
    
    // Watchlist helpers
    private void addMovie(String token, long id) throws Exception {
        WatchlistPosting posting = new WatchlistPosting(WatchlistType.MOVIE, id);
        mockMvc.perform(post("/watchlist")
        .header("Authorization", bearer(token))
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(posting)))
        .andExpect(status().isOk());
    }
    
    private void addSeries(String token, long id) throws Exception {
        WatchlistPosting posting = new WatchlistPosting(WatchlistType.SERIES, id);
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
                        .param("type", WatchlistType.MOVIE.name())) // "MOVIE"
                .andExpect(status().isOk());
    }
    
    private void removeSeries(String token, long id) throws Exception {
        mockMvc.perform(delete("/watchlist")
                        .header("Authorization", bearer(token))
                        .param("id", String.valueOf(id))
                        .param("type", WatchlistType.SERIES.name())) // "MOVIE"
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
    
        // B authenticates and accepts
        authenticate("bob@example.com", "password123");
        mockMvc.perform(put("/friends/update")
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new FriendUpdatingBody("alice@example.com", Status.ACCEPTED))))
                .andExpect(status().isOk());
    
        // Both should see each other in friends list
        mockMvc.perform(get("/friends/friend")
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].user.email", hasItem("bob@example.com")))
                .andExpect(jsonPath("$[*].status", hasItem("ACCEPTED")));
    
        mockMvc.perform(get("/friends/friend")
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].user.email", hasItem("alice@example.com")))
                .andExpect(jsonPath("$[*].status", hasItem("ACCEPTED")));
    
        // A deletes friendship
        mockMvc.perform(delete("/friends/delete")
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmailBody("bob@example.com"))))
                .andExpect(status().isOk());
    }

}
