package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.MovieStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu tạo hoặc cập nhật phim")
public class MovieRequest {

    @NotBlank(message = "Tên phim không được để trống")
    @Size(max = 255, message = "Tên phim không vượt quá 255 ký tự")
    @Schema(description = "Tên phim", example = "Avengers: Secret Wars")
    private String title;

    @Schema(description = "Mô tả phim")
    private String description;

    @NotNull(message = "Thời lượng phim không được để trống")
    @Positive(message = "Thời lượng phim phải lớn hơn 0")
    @Schema(description = "Thời lượng phim tính theo phút", example = "165")
    private Integer duration;

    @Size(max = 255, message = "Tên đạo diễn không vượt quá 255 ký tự")
    @Schema(description = "Đạo diễn", example = "Anthony Russo")
    private String director;

    @Schema(description = "Diễn viên")
    private String castMembers;

    @Size(max = 100, message = "Ngôn ngữ không vượt quá 100 ký tự")
    @Schema(description = "Ngôn ngữ", example = "English")
    private String language;

    @Size(max = 50, message = "Giới hạn độ tuổi không vượt quá 50 ký tự")
    @Schema(description = "Giới hạn độ tuổi", example = "13+")
    private String ageRating;

    @Schema(description = "Ngày khởi chiếu", example = "2026-12-25")
    private LocalDate releaseDate;

    @Schema(description = "URL poster")
    private String poster;

    @Schema(description = "URL trailer")
    private String trailer;

    @NotNull(message = "Trạng thái phim không được để trống")
    @Schema(description = "Trạng thái phim", example = "NOW_SHOWING")
    private MovieStatus status;

    @Schema(description = "Danh sách ID thể loại đã tồn tại")
    private Set<UUID> genreIds;
}
