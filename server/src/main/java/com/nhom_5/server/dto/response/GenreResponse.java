package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Genre;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin thể loại phim")
public class GenreResponse {

    private UUID id;
    private String name;

    public static GenreResponse fromEntity(Genre genre) {
        if (genre == null) {
            return null;
        }
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build();
    }
}
