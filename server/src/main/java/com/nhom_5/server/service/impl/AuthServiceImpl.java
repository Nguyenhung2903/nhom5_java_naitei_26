package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.ChangePasswordRequest;
import com.nhom_5.server.dto.request.LoginRequest;
import com.nhom_5.server.dto.request.RegisterRequest;
import com.nhom_5.server.dto.response.AuthResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import com.nhom_5.server.security.JwtService;
import com.nhom_5.server.service.AuthService;
import com.nhom_5.server.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Processing user registration for username: [{}], email: [{}]", request.getUsername(), request.getEmail());

        // Kiểm tra xem username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        // Kiểm tra xem email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Tạo entity User mới với mật khẩu đã mã hóa BCrypt
        User newUser = User.builder()
                .username(request.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .birthday(request.getBirthday())
                .gender(request.getGender())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("User registered successfully with ID: [{}]", savedUser.getId());

        // Tạo JWT Token cho tài khoản mới đăng ký
        String token = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .user(UserProfileDto.fromEntity(savedUser))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        log.info("Processing login attempt for identifier: [{}]", identifier);

        try {
            // Xác thực thông tin đăng nhập qua Spring Security AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
            );

            // Tìm entity User theo username hoặc email
            User user = userRepository.findByUsernameOrEmail(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

            // Kiểm tra trạng thái tài khoản
            if (user.getStatus() == UserStatus.LOCKED) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED);
            }

            // Sinh Access Token
            String token = jwtService.generateToken(user);
            log.info("User [{}] logged in successfully", user.getUsername());

            return AuthResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtService.getExpirationMs())
                    .user(UserProfileDto.fromEntity(user))
                    .build();

        } catch (BadCredentialsException ex) {
            log.warn("Login failed for identifier [{}]: Invalid credentials", identifier);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        } catch (LockedException | DisabledException ex) {
            log.warn("Login failed for identifier [{}]: Account is locked or disabled", identifier);
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        User currentUser = SecurityUtil.getCurrentUser();
        // Load lại phiên bản mới nhất từ database để đảm bảo tính nhất quán
        User freshUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return UserProfileDto.fromEntity(freshUser);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User currentUser = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }

        // Kiểm tra xác nhận mật khẩu mới
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_DO_NOT_MATCH);
        }

        // Cập nhật mật khẩu mới đã mã hóa
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user ID: [{}]", user.getId());
    }
}
