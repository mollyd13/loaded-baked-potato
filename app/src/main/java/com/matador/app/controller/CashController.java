package com.matador.app.controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.matador.app.service.CashService;
import com.matador.app.entity.Cash;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/cash")
public class CashController {

    private CashService cashService;

    public CashController(CashService cashService) {
        this.cashService = cashService;
    }

    // Endpoint to get cash details by ID
    @RequestMapping("/{id}")
    public ResponseEntity<Cash> getCash(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(cashService.getCash(id));
    }
}
