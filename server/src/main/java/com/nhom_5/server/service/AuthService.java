package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ChangePasswordRequest;
import com.nhom_5.server.dto.request.LoginRequest;
import com.nhom_5.server.dto.request.RegisterRequest;
import com.nhom_5.server.dto.response.AuthResponse;
import com.nhom_5.server.dto.response.UserProfileDto;

public interface AuthService {

    /**
     * Đăng ký tài khoản người dùng mới (Mặc định Role: USER, Status: ACTIVE)
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Đăng nhập hệ thống bằng Username hoặc Email kèm Password
     */
    AuthResponse login(LoginRequest request);

    /**
     * Lấy thông tin hồ sơ của người dùng hiện đang đăng nhập
     */
    UserProfileDto getCurrentUserProfile();

    /**
     * Đổi mật khẩu cho người dùng hiện đang đăng nhập
     */
    void changePassword(ChangePasswordRequest request);
}
