package com.matador.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.UserProfileRepository;
import com.matador.app.service.AuthService;
import com.matador.app.service.LoginAttemptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class LockoutTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        UserProfileRepository profiles = mock(UserProfileRepository.class);
        UserProfile user = new UserProfile("Test", "User", "a@x.com", "unused", "5550000000", "USER", LocalDateTime.now());
        when(profiles.findByEmail(anyString())).thenReturn(Optional.of(user));

        AuthService authService = new AuthService(profiles, mock(PasswordEncoder.class));
        AuthenticationManager authManager = authentication -> {
            if (!"right".equals(authentication.getCredentials())) {
                throw new BadCredentialsException("Wrong password");
            }
            return UsernamePasswordAuthenticationToken.authenticated(
                authentication.getPrincipal(), null, List.of());
        };
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(
            authService, authManager, new HttpSessionSecurityContextRepository(), new LoginAttemptService()))
            .build();
    }

    private ResultActions login(String email, String password) throws Exception {
        return mvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(Map.of("email", email, "password", password))));
    }

    @Test
    void successfulLoginResetsFailedAttempts() throws Exception {
        for (int i = 0; i < 4; i++) {
            login("a@x.com", "wrong").andExpect(status().isUnauthorized());
        }
        login("a@x.com", "right").andExpect(status().isOk());
        for (int i = 0; i < 4; i++) {
            login("a@x.com", "wrong").andExpect(status().isUnauthorized());
        }
        login("a@x.com", "right").andExpect(status().isOk());
    }

    @Test
    void fiveFailuresLockTheAccount() throws Exception {
        for (int i = 0; i < 5; i++) {
            login("a@x.com", "wrong").andExpect(status().isUnauthorized());
        }
        login("a@x.com", "right")
            .andExpect(status().is(423))
            .andExpect(jsonPath("$.message").value("Too many failed attempts. Try again in 15 minutes."));
        login("a@x.com", "wrong").andExpect(status().is(423));
    }

    @Test
    void lockoutNormalizesEmailAndIsPerAccount() throws Exception {
        for (int i = 0; i < 5; i++) {
            login("A@X.com ", "wrong").andExpect(status().isUnauthorized());
        }
        login("a@x.com", "right").andExpect(status().is(423));
        login("other@x.com", "right").andExpect(status().isOk());
    }
}
