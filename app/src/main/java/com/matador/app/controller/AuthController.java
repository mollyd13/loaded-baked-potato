package com.matador.app.controller;

import jakarta.servlet.http.HttpSession;

import java.time.LocalDateTime;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.matador.app.entity.UserProfile;
import com.matador.app.service.UserProfileService;

@Controller
public class AuthController {

    private UserProfileService userProfileService;

    public AuthController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping("/register")
    public String register(@RequestParam String email, 
                        @RequestParam String password,
                        @RequestParam String firstName,
                        @RequestParam String lastName,
                        @RequestParam String roleType,
                        @RequestParam Integer phone,
                        RedirectAttributes redirectAttributes) {
        try {
            UserProfile newUser = new UserProfile();
            newUser.setEmail(email);
            newUser.setPasswordHash(password);  // UserProfileService will hash it
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setRoleType(roleType);
            newUser.setPhone(phone);
            newUser.setCreatedAt(LocalDateTime.now());
            
            userProfileService.register(newUser);
            redirectAttributes.addFlashAttribute("message", "Registration successful. Please login.");
            return "redirect:/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Registration failed: " + e.getMessage());
            return "redirect:/register";
        }
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";  // Returns register.html template
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";  // Returns login.html template
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";  // Secured endpoint
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return "redirect:/login?logout=true";
    }

    @GetMapping("/logout")
    public String logoutGet(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return "redirect:/login?logout=true";
    }
}