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
@Schema(description = "Chi tiết lỗi validation cho từng trường")
public class FieldErrorDto {

    @Schema(description = "Tên trường bị lỗi", example = "email")
    private String field;

    @Schema(description = "Thông điệp lỗi chi tiết", example = "Email không đúng định dạng")
    private String message;
}
