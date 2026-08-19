package com.nhom_5.server.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.io.IOException;
import java.net.URI;

@Slf4j
@Component
public class SwaggerAutoOpenListener {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Value("${app.swagger.auto-open:true}")
    private boolean autoOpen;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String baseUrl = "http://localhost:" + serverPort + contextPath;
        String swaggerUrl = baseUrl + "/swagger-ui/index.html";
        String apiDocsUrl = baseUrl + "/v3/api-docs";
        String clientUrl = "http://localhost:5173";

        // In banner thông tin khởi động trên Console Log
        log.info("\n" +
                "=================================================================================\n" +
                "  🏋️  RoGym Gym Management API Server đã khởi động thành công!\n" +
                "---------------------------------------------------------------------------------\n" +
                "  🌐  Base API URL  : {}\n" +
                "  🚀  Swagger UI    : {}\n" +
                "  📑  OpenAPI Spec  : {}\n" +
                "  💻  React Client  : {}\n" +
                "=================================================================================",
                baseUrl, swaggerUrl, apiDocsUrl, clientUrl);

        if (autoOpen) {
            openBrowser(swaggerUrl);
        }
    }

    private void openBrowser(String url) {
        log.info("Đang tự động mở Swagger UI trên trình duyệt: {}", url);
        String os = System.getProperty("os.name").toLowerCase();

        try {
            if (os.contains("win")) {
                // Windows command
                new ProcessBuilder("cmd.exe", "/c", "start", url).start();
            } else if (os.contains("mac")) {
                // macOS command
                new ProcessBuilder("open", url).start();
            } else if (os.contains("nix") || os.contains("nux")) {
                // Linux / Unix command
                new ProcessBuilder("xdg-open", url).start();
            } else if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(URI.create(url));
            } else {
                log.warn("Môi trường không hỗ trợ mở trình duyệt tự động. Vui lòng truy cập thủ công: {}", url);
            }
        } catch (IOException e) {
            log.warn("Không thể tự động mở trình duyệt: {}. Bạn có thể mở thủ công theo link: {}", e.getMessage(), url);
        }
    }
}
