package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Genre;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin thể loại phim")
public class GenreResponse {

    @Schema(description = "ID của thể loại (UUID)", example = "cc1fdf16-e524-4c87-a027-74de957a0359")
    private UUID id;

    @Schema(description = "Tên thể loại phim", example = "Hành Động")
    private String name;

    @Schema(description = "Mô tả chi tiết thể loại", example = "Phim có tiết tấu nhanh, nhiều pha rượt đuổi...")
    private String description;

    @Schema(description = "Số lượng phim đang thuộc thể loại này", example = "5")
    private Integer movieCount;

    @Schema(description = "Thời điểm tạo")
    private Instant createdAt;

    @Schema(description = "Thời điểm cập nhật gần nhất")
    private Instant updatedAt;

    public static GenreResponse fromEntity(Genre genre) {
        if (genre == null) {
            return null;
        }
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .description(genre.getDescription())
                .movieCount(genre.getMovies() != null ? genre.getMovies().size() : 0)
                .createdAt(genre.getCreatedAt())
                .updatedAt(genre.getUpdatedAt())
                .build();
    }
}
