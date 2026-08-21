package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.NewsRequest;
import com.nhom_5.server.dto.response.NewsResponse;

import java.util.List;
import java.util.UUID;

public interface NewsService {

    List<NewsResponse> getNews(String keyword);

    NewsResponse getNewsById(UUID id);

    NewsResponse createNews(NewsRequest request);

    NewsResponse updateNews(UUID id, NewsRequest request);

    void deleteNews(UUID id);
}
