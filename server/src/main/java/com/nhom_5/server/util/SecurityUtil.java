package com.nhom_5.server.util;

import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * Lớp tiện ích hỗ trợ trích xuất thông tin User đang đăng nhập từ SecurityContextHolder.
 * Mọi lập trình viên trong dự án có thể gọi trực tiếp các phương thức static ở bất kỳ tầng Service hoặc Controller nào.
 */
public final class SecurityUtil {

    private SecurityUtil() {
        // Prevent instantiation
    }

    /**
     * Lấy Authentication hiện tại trong SecurityContext
     */
    public static Optional<Authentication> getAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(auth -> auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()));
    }

    /**
     * Lấy CustomUserDetails của người dùng hiện tại
     */
    public static Optional<CustomUserDetails> getCurrentUserDetails() {
        return getAuthentication()
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof CustomUserDetails)
                .map(principal -> (CustomUserDetails) principal);
    }

    /**
     * Lấy User Entity đầy đủ của người dùng hiện tại
     * Ném AppException(ErrorCode.UNAUTHORIZED) nếu chưa đăng nhập
     */
    public static User getCurrentUser() {
        return getCurrentUserDetails()
                .map(CustomUserDetails::getUser)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
    }

    /**
     * Lấy ID của người dùng hiện tại (UUID)
     */
    public static UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Lấy Username của người dùng hiện tại
     */
    public static String getCurrentUsername() {
        return getCurrentUser().getUsername();
    }

    /**
     * Lấy Email của người dùng hiện tại
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    /**
     * Kiểm tra xem người dùng hiện tại có quyền ADMIN hay không
     */
    public static boolean isAdmin() {
        return getCurrentUserDetails()
                .map(CustomUserDetails::getUser)
                .map(user -> user.getRole() == Role.ADMIN)
                .orElse(false);
    }
}
