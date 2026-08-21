package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.News;
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
@Schema(description = "Thông tin tin tức")
public class NewsResponse {

    private UUID id;
    private String title;
    private String content;
    private String thumbnail;
    private Instant createdAt;
    private Instant updatedAt;

    public static NewsResponse fromEntity(News news) {
        if (news == null) {
            return null;
        }
        return NewsResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .content(news.getContent())
                .thumbnail(news.getThumbnail())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .build();
    }
}
