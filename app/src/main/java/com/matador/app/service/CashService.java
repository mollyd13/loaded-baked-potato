package com.matador.app.service;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.matador.app.repository.CashRepository;
import com.matador.app.entity.Cash;

@Service
public class CashService {

    private CashRepository cashRepository;

    public CashService(CashRepository cashRepository) {
        this.cashRepository = cashRepository;
    }

    // Method to get cash details by ID
    public Cash getCash(Integer id) {
        return cashRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Cash not found for user id: " + id));
    }

}
