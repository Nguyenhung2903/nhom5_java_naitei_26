package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Dữ liệu tạo người dùng mới từ trang quản trị (Admin)")
public class CreateUserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    @Schema(description = "Tên đăng nhập", example = "staff01")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Địa chỉ email không đúng định dạng")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    @Schema(description = "Địa chỉ email", example = "staff01@cinemanest.vn")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    @Schema(description = "Mật khẩu khởi tạo", example = "Admin@123456")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    @Schema(description = "Họ và tên đầy đủ", example = "Staff User")
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

    @Schema(description = "Đường dẫn ảnh đại diện", example = "https://example.com/avatar.jpg")
    private String avatar;

    @Builder.Default
    @Schema(description = "Vai trò trong hệ thống", example = "USER")
    private Role role = Role.USER;

    @Builder.Default
    @Schema(description = "Trạng thái tài khoản", example = "ACTIVE")
    private UserStatus status = UserStatus.ACTIVE;

    @jakarta.validation.constraints.Min(value = 0, message = "Điểm thưởng không được âm")
    @Schema(description = "Điểm thưởng tích lũy", example = "100")
    @Builder.Default
    private Integer points = 0;
}
