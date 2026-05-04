package com.loom.backend.controller;

import com.loom.backend.model.RefreshToken;
import com.loom.backend.model.User;
import com.loom.backend.model.Role;
import com.loom.backend.payload.request.LoginRequest;
import com.loom.backend.payload.request.SignupRequest;
import com.loom.backend.payload.response.AuthResponse;
import com.loom.backend.payload.response.MessageResponse;
import com.loom.backend.repository.UserRepository;
import com.loom.backend.security.JwtUtils;
import com.loom.backend.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String accessToken = jwtUtils.generateJwtToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtUtils.createAccessTokenCookie(accessToken).toString())
                .header(HttpHeaders.SET_COOKIE, jwtUtils.createRefreshTokenCookie(refreshToken.getToken()).toString())
                .body(new AuthResponse(userDetails.getUsername(), roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String refreshTokenValue = jwtUtils.getRefreshTokenFromCookies(request);

        if (refreshTokenValue == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Refresh token is missing."));
        }

        return refreshTokenService.findByToken(refreshTokenValue)
                .map(refreshTokenService::verifyExpiration)
                .map(oldToken -> {
                    RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(oldToken);
                    String newAccessToken = jwtUtils.generateTokenFromUsername(newRefreshToken.getUser().getUsername());

                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, jwtUtils.createAccessTokenCookie(newAccessToken).toString())
                            .header(HttpHeaders.SET_COOKIE, jwtUtils.createRefreshTokenCookie(newRefreshToken.getToken()).toString())
                            .body(new MessageResponse("Token refreshed successfully."));
                })
                .orElseGet(() -> ResponseEntity.badRequest()
                        .header(HttpHeaders.SET_COOKIE, jwtUtils.clearAccessTokenCookie().toString())
                        .header(HttpHeaders.SET_COOKIE, jwtUtils.clearRefreshTokenCookie().toString())
                        .body(new MessageResponse("Invalid refresh token.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                refreshTokenService.deleteByUser(user);
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtUtils.clearAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, jwtUtils.clearRefreshTokenCookie().toString())
                .body(new MessageResponse("Logged out successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails)) {
            return ResponseEntity.status(401).body(new MessageResponse("Not authenticated."));
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AuthResponse(userDetails.getUsername(), roles));
    }
}
