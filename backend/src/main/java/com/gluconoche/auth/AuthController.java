package com.gluconoche.auth;

import com.gluconoche.auth.dto.AuthStatusResponse;
import com.gluconoche.auth.dto.ChangePinRequest;
import com.gluconoche.auth.dto.LoginRequest;
import com.gluconoche.auth.dto.LoginResponse;
import com.gluconoche.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.verifyPin(request.getPin());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/change-pin")
    public ResponseEntity<ApiResponse<Void>> changePin(@Valid @RequestBody ChangePinRequest request) {
        authService.changePin(request.getCurrentPin(), request.getNewPin());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<AuthStatusResponse>> status() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getStatus()));
    }
}
