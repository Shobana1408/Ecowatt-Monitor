package com.ecowatt.service;

import com.ecowatt.entity.User;
import com.ecowatt.repository.UserRepository;
import com.ecowatt.web.dto.AuthResponse;
import com.ecowatt.web.dto.LoginRequest;
import com.ecowatt.web.dto.RegisterRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretKey secretKey;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        @Value("${jwt.secret:your-secret-key-change-this-in-production-min-256-bits}") String jwtSecret
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
            .username(request.username())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .build();

        user = userRepository.save(user);

        String token = generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getId());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token: " + e.getMessage());
        }
    }

    private String generateToken(String username) {
        long now = System.currentTimeMillis();
        long expiration = now + 86400000; // 24 hours

        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date(now))
            .expiration(new Date(expiration))
            .signWith(secretKey)
            .compact();
    }
}

