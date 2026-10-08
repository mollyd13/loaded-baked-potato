package com.matador.app.controller;

import com.matador.app.dto.TradeResponse;
import com.matador.app.repository.TradeRepository;
import com.matador.app.repository.UserProfileRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trades")
public class TradeController {
    private final TradeRepository tradeRepository;
    private final UserProfileRepository userRepository;

    public TradeController(TradeRepository tradeRepository, UserProfileRepository userRepository) {
        this.tradeRepository = tradeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<TradeResponse> myTrades(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return tradeRepository.findByUserProfile(user).stream().map(TradeResponse::from).toList();
    }
}
