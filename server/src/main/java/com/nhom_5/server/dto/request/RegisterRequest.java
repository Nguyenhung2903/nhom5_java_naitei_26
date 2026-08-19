package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Dữ liệu yêu cầu đăng ký tài khoản mới")
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải có từ 3 đến 50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Tên đăng nhập chỉ chứa chữ cái, chữ số, dấu chấm, gạch dưới và gạch nối")
    @Schema(description = "Tên đăng nhập", example = "nguyen_van_a")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải có độ dài từ 6 ký tự trở lên")
    @Schema(description = "Mật khẩu đăng nhập", example = "Password@123")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Địa chỉ email", example = "nguyenvana@gmail.com")
    private String email;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không vượt quá 100 ký tự")
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn A")
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$|^$", message = "Số điện thoại không đúng định dạng (10 chữ số)")
    @Schema(description = "Số điện thoại liên hệ (tùy chọn)", example = "0912345678")
    private String phone;

    @Schema(description = "Ngày sinh (tùy chọn)", example = "2000-01-15")
    private LocalDate birthday;

    @Schema(description = "Giới tính (tùy chọn: Nam/Nữ/Khác)", example = "Nam")
    private String gender;
}
