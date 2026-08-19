package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin hồ sơ người dùng")
public class UserProfileDto {

    @Schema(description = "ID người dùng (UUID)", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    private UUID id;

    @Schema(description = "Tên đăng nhập", example = "admin")
    private String username;

    @Schema(description = "Địa chỉ email", example = "admin@cinemanest.vn")
    private String email;

    @Schema(description = "Họ và tên", example = "System Administrator")
    private String fullName;

    @Schema(description = "Vai trò trong hệ thống", example = "ADMIN")
    private Role role;

    @Schema(description = "Trạng thái tài khoản", example = "ACTIVE")
    private UserStatus status;

    @Schema(description = "Số điện thoại", example = "0912345678")
    private String phone;

    @Schema(description = "Ngày sinh", example = "1995-05-20")
    private LocalDate birthday;

    @Schema(description = "Giới tính", example = "Nam")
    private String gender;

    @Schema(description = "Đường dẫn ảnh đại diện")
    private String avatar;

    @Schema(description = "Thời gian tạo tài khoản")
    private Instant createdAt;

    @Schema(description = "Thời gian cập nhật gần nhất")
    private Instant updatedAt;

    public static UserProfileDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .phone(user.getPhone())
                .birthday(user.getBirthday())
                .gender(user.getGender())
                .avatar(user.getAvatar())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
