package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Dữ liệu tạo hoặc cập nhật thể loại phim")
public class GenreRequest {

    @NotBlank(message = "Tên thể loại không được để trống")
    @Size(max = 100, message = "Tên thể loại không vượt quá 100 ký tự")
    @Schema(description = "Tên thể loại phim", example = "Hành Động")
    private String name;

    @Size(max = 500, message = "Mô tả thể loại không vượt quá 500 ký tự")
    @Schema(description = "Mô tả chi tiết thể loại", example = "Các bộ phim có tiết tấu nhanh, nhiều pha rượt đuổi, võ thuật...")
    private String description;
}
