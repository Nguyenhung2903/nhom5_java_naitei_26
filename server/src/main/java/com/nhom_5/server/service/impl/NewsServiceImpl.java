package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.NewsRequest;
import com.nhom_5.server.dto.response.NewsResponse;
import com.nhom_5.server.entity.News;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.NewsRepository;
import com.nhom_5.server.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NewsResponse> getNews(String keyword) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        List<News> news = normalizedKeyword == null
                ? newsRepository.findAllByOrderByCreatedAtDesc()
                : newsRepository.search(normalizedKeyword);

        return news.stream()
                .map(NewsResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NewsResponse getNewsById(UUID id) {
        return NewsResponse.fromEntity(findNews(id));
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request) {
        News news = News.builder().build();
        applyRequest(news, request);
        return NewsResponse.fromEntity(newsRepository.save(news));
    }

    @Override
    @Transactional
    public NewsResponse updateNews(UUID id, NewsRequest request) {
        News news = findNews(id);
        applyRequest(news, request);
        return NewsResponse.fromEntity(newsRepository.save(news));
    }

    @Override
    @Transactional
    public void deleteNews(UUID id) {
        News news = findNews(id);
        newsRepository.delete(news);
    }

    private News findNews(UUID id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy tin tức với ID: " + id));
    }

    private void applyRequest(News news, NewsRequest request) {
        news.setTitle(request.getTitle().trim());
        news.setContent(request.getContent().trim());
        news.setThumbnail(trimToNull(request.getThumbnail()));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
