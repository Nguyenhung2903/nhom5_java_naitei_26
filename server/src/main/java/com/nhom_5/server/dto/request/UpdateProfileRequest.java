package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Dữ liệu cập nhật hồ sơ cá nhân của người dùng")
public class UpdateProfileRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    @Schema(description = "Tên đăng nhập", example = "johndoe")
    private String username;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    @Schema(description = "Họ và tên đầy đủ", example = "John Doe")
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không đúng định dạng Việt Nam")
    @Schema(description = "Số điện thoại", example = "0912345678")
    private String phone;

    @Past(message = "Ngày sinh phải trong quá khứ")
    @Schema(description = "Ngày sinh", example = "1998-08-15")
    private LocalDate birthday;

    @Size(max = 20, message = "Giới tính không được vượt quá 20 ký tự")
    @Schema(description = "Giới tính", example = "Nam")
    private String gender;

    @Schema(description = "Đường dẫn ảnh đại diện", example = "https://example.com/avatar.jpg")
    private String avatar;
}
