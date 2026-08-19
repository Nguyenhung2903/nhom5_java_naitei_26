package com.nhom_5.server.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Kết quả xác thực khi đăng nhập hoặc đăng ký thành công")
public class AuthResponse {

    @Schema(description = "JWT Access Token dùng để đính kèm vào Header Authorization", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Builder.Default
    @Schema(description = "Loại Token", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Thời gian hết hạn của token (tính bằng milliseconds)", example = "604800000")
    private long expiresIn;

    @Schema(description = "Thông tin chi tiết của người dùng vừa đăng nhập")
    private UserProfileDto user;
}
