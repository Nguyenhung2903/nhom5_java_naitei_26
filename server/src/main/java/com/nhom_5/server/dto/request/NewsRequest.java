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
@Schema(description = "Dữ liệu tạo hoặc cập nhật tin tức")
public class NewsRequest {

    @NotBlank(message = "Tiêu đề tin tức không được để trống")
    @Size(max = 255, message = "Tiêu đề tin tức không vượt quá 255 ký tự")
    @Schema(description = "Tiêu đề tin tức", example = "Lịch chiếu phim Tết 2027")
    private String title;

    @NotBlank(message = "Nội dung tin tức không được để trống")
    @Schema(description = "Nội dung tin tức")
    private String content;

    @Schema(description = "URL ảnh đại diện tin tức")
    private String thumbnail;
}
