package com.matador.app.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.matador.app.service.UpdateUserService;
import com.matador.app.dto.UpdateUserRequest;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UpdateUserService updateUserService;

    public UserController(UpdateUserService updateUserService) {
        this.updateUserService = updateUserService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Integer id, @Valid @RequestBody UpdateUserRequest request) {
        try {
            updateUserService.updateUser(request, id);
            return ResponseEntity.status(204).body("User updated successfully");
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed with error: " + e.getMessage());
        }
    }
    
}
