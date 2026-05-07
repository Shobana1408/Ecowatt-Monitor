package com.ecowatt.web.dto;

public record AuthResponse(
    String token,
    String username,
    String email,
    Long userId
) {}

