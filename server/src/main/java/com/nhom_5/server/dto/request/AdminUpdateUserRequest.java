package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu cập nhật người dùng từ trang quản trị (Admin)")
public class AdminUpdateUserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    @Schema(description = "Tên đăng nhập", example = "staff01_updated")
    private String username;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    @Schema(description = "Họ và tên đầy đủ", example = "Staff User Updated")
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không đúng định dạng Việt Nam")
    @Schema(description = "Số điện thoại", example = "0987654321")
    private String phone;

    @Past(message = "Ngày sinh phải trong quá khứ")
    @Schema(description = "Ngày sinh", example = "1996-03-20")
    private LocalDate birthday;

    @Size(max = 20, message = "Giới tính không được vượt quá 20 ký tự")
    @Schema(description = "Giới tính", example = "Nữ")
    private String gender;

    @Schema(description = "Đường dẫn ảnh đại diện", example = "https://example.com/avatar_new.jpg")
    private String avatar;

    @NotNull(message = "Vai trò không được để trống")
    @Schema(description = "Vai trò trong hệ thống", example = "ADMIN")
    private Role role;

    @NotNull(message = "Trạng thái không được để trống")
    @Schema(description = "Trạng thái tài khoản", example = "ACTIVE")
    private UserStatus status;

    @Size(min = 6, max = 100, message = "Mật khẩu mới phải từ 6 đến 100 ký tự nếu cung cấp")
    @Schema(description = "Mật khẩu mới (Tùy chọn: chỉ truyền khi muốn đặt lại mật khẩu cho user)", example = "NewPass@123")
    private String password;

    @jakarta.validation.constraints.Min(value = 0, message = "Điểm thưởng không được âm")
    @Schema(description = "Điểm thưởng tích lũy", example = "150")
    private Integer points;
}
