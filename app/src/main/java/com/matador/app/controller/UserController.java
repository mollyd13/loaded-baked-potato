package com.matador.app.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.matador.app.service.UpdateUserService;
import com.matador.app.dto.ChangePasswordRequest;
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
        updateUserService.updateUserInfo(request, id);
        return ResponseEntity.status(204).body("User updated successfully");
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<String> changePassword(@PathVariable Integer id, @Valid @RequestBody ChangePasswordRequest request) {
        updateUserService.changePassword(id, request);
        return ResponseEntity.status(204).body("Password changed successfully");
    }
    
}
