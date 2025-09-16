package com.Backend.services.user_service.controller;

import com.Backend.exception.GlobalExceptionHandler;
import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import com.Backend.config.SecurityConfig;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
 

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import com.Backend.springSecurity.jwtAuthentication.JwtFilterChain;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@WebMvcTest(
        controllers = UserController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockBean
    private UserService userService;

    @MockBean
    private JwtFilterChain jwtFilterChain;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private PasswordEncoder passwordEncoder;

    

    @Test
    @DisplayName("GET /users returns list of users")
    void getAllUsers_returnsOk() throws Exception {
        User u1 = User.builder().id(1L).username("john").email("john@example.com").password("secret123").role(ROLE.ROLE_USER).build();
        User u2 = User.builder().id(2L).username("jane").email("jane@example.com").password("secret123").role(ROLE.ROLE_USER).build();
        when(userService.getAllUsers()).thenReturn(List.of(u1, u2));

        mockMvc.perform(get("/users")).andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].username", is("john@example.com")))
                .andExpect(jsonPath("$[0].email", is("john@example.com")));

        verify(userService, times(1)).getAllUsers();
    }

    @Test
    @DisplayName("POST /users register returns token")
    void registerUser_returnsToken() throws Exception {
        RegisterDTO req = new RegisterDTO("john", "john@example.com", "password123");
        when(userService.registerUser(any(RegisterDTO.class))).thenReturn(new JwtToken("abc.def.ghi"));

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("abc.def.ghi")));

        verify(userService).registerUser(any(RegisterDTO.class));
    }

    @Test
    @DisplayName("POST /users/authenticate returns token")
    void authenticateUser_returnsToken() throws Exception {
        AuthenticateDTO req = new AuthenticateDTO("john@example.com", "password123");
        when(userService.authenticateUser(any(AuthenticateDTO.class))).thenReturn(new JwtToken("jwt.token"));

        mockMvc.perform(post("/users/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("jwt.token")));

        verify(userService).authenticateUser(any(AuthenticateDTO.class));
    }

    @Disabled("Covered by UserControllerSecurityTest with security enabled")
    @DisplayName("GET /users/me returns authenticated user from principal")
    void getMe_returnsPrincipalUser() throws Exception {
        User principal = User.builder()
                .id(99L)
                .username("me")
                .email("me@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();

        mockMvc.perform(get("/users/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities())
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(99)))
                .andExpect(jsonPath("$.email", is("me@example.com")))
                .andExpect(jsonPath("$.username", is("me@example.com")));
    }

    @Disabled("Covered by UserControllerSecurityTest with security enabled")
    @DisplayName("PUT /users updates and returns user")
    void updateUser_returnsUpdated() throws Exception {
        User principal = User.builder()
                .id(5L)
                .username("old")
                .email("old@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();

        UpdateUserDTO req = new UpdateUserDTO("newname", "new@example.com");
        User updated = User.builder().id(5L).username("newname").email("new@example.com").password("password123").role(ROLE.ROLE_USER).build();
        when(userService.updateUser(eq(req), eq(principal))).thenReturn(updated);

        mockMvc.perform(put("/users")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities())
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(5)))
                .andExpect(jsonPath("$.username", is("new@example.com")))
                .andExpect(jsonPath("$.email", is("new@example.com")));

        verify(userService).updateUser(eq(req), eq(principal));
    }

    @Disabled("Covered by UserControllerSecurityTest with security enabled")
    @DisplayName("DELETE /users deletes and returns message")
    void deleteUser_returnsMessage() throws Exception {
        User principal = User.builder()
                .id(7L)
                .username("abc")
                .email("abc@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();

        doNothing().when(userService).deleteUserById(7L);

        mockMvc.perform(delete("/users")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities())
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("User with id 7 deleted successfully")));

        verify(userService).deleteUserById(7L);
    }
}
