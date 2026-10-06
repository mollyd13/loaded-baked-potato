package com.matador.app.service;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private record State(int fails, Instant lockedUntil) {}
    private final Map<String, State> states = new ConcurrentHashMap<>();

    public boolean isLocked(String email) {
        State s = states.get(email);
        return s != null && s.lockedUntil() != null && s.lockedUntil().isAfter(Instant.now());
    }

    public void recordFailure(String email) {
        states.compute(email, (k, s) -> {
            int fails = (s == null ? 0 : s.fails()) + 1;
            return fails >= MAX_ATTEMPTS
                ? new State(0, Instant.now().plusSeconds(LOCK_MINUTES * 60))
                : new State(fails, null);
        });
    }

    public void reset(String email) {
        states.remove(email);
    }
}
