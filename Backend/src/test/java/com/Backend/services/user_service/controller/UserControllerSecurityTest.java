package com.Backend.services.user_service.controller;

import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.model.UpdateUserDTO;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Security-enabled slice for endpoints that rely on @AuthenticationPrincipal
@WebMvcTest(
        controllers = UserController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.Backend.config.SecurityConfig.class)
)
@AutoConfigureMockMvc(addFilters = false)
@Import({UserControllerSecurityTest.SecurityTestConfig.class, com.Backend.exception.GlobalExceptionHandler.class})
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockBean
    private UserService userService;

    @MockBean
    private com.Backend.springSecurity.jwtAuthentication.JwtFilterChain jwtFilterChain;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @TestConfiguration
    static class SecurityTestConfig {
        @Bean
        @Primary
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }

        // Prevent serialization issues for UserDetails fields in tests
        @Bean
        Jackson2ObjectMapperBuilderCustomizer userMixinCustomizer() {
            return builder -> builder.mixIn(com.Backend.services.user_service.model.User.class, UserMixin.class);
        }

        @JsonIgnoreProperties({
                "authorities",
                "accountNonExpired",
                "accountNonLocked",
                "credentialsNonExpired",
                "enabled",
                "password",
                "watchlist"
        })
        abstract static class UserMixin {}
    }

    private User principal() {
        return User.builder()
                .id(99L)
                .username("me")
                .email("me@example.com")
                .password("password123")
                .role(ROLE.ROLE_USER)
                .build();
    }

    @Test
    @DisplayName("GET /users/me returns authenticated principal")
    void me_authenticated_ok() throws Exception {
        User p = principal();

        mockMvc.perform(get("/users/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(p, p.getPassword(), p.getAuthorities())
                        )))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(99)))
                .andExpect(jsonPath("$.email", is("me@example.com")))
                .andExpect(jsonPath("$.username", is("me@example.com")));
    }

    @Test
    @DisplayName("PUT /users updates and returns user (authenticated)")
    void update_authenticated_ok() throws Exception {
        User p = principal();
        UpdateUserDTO req = new UpdateUserDTO("newname", "new@example.com");
        User updated = User.builder().id(99L).username("newname").email("new@example.com").password("password123").role(ROLE.ROLE_USER).build();
        when(userService.updateUser(eq(req), eq(p))).thenReturn(updated);

        mockMvc.perform(put("/users")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(p, p.getPassword(), p.getAuthorities())
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(99)))
                .andExpect(jsonPath("$.email", is("new@example.com")))
                .andExpect(jsonPath("$.username", is("new@example.com")));

        verify(userService).updateUser(eq(req), eq(p));
    }

    @Test
    @DisplayName("DELETE /users deletes and returns message (authenticated)")
    void delete_authenticated_ok() throws Exception {
        User p = principal();
        doNothing().when(userService).deleteUserById(99L);

        mockMvc.perform(delete("/users")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(p, p.getPassword(), p.getAuthorities())
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("User with id 99 deleted successfully")));

        verify(userService).deleteUserById(99L);
    }
}
