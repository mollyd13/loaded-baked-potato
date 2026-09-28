package com.matador.app.service;

import com.matador.app.DTO.OrderRequestDto;
import com.matador.app.domain.ValidationResult;
import org.springframework.stereotype.Service;

@Service
public class OrderValidator {

    // just return valid for now
    public ValidationResult validate(OrderRequestDto request) {
        return ValidationResult.valid();
    }
    
}
