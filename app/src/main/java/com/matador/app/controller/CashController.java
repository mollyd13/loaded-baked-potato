package com.matador.app.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.matador.app.service.CashService;
import com.matador.app.dto.CashResponse;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/cash")
public class CashController {

    private CashService cashService;

    public CashController(CashService cashService) {
        this.cashService = cashService;
    }

    // Endpoint to get cash details by currency
    @GetMapping("/{currency}")
    public ResponseEntity<CashResponse> getCash(@PathVariable("currency") String currency) {
        return ResponseEntity.ok(cashService.getCash(currency));
    }
}
