package com.nhom_5.server.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CinemaNest API Documentation")
                        .description("Tài liệu API RESTful chuẩn hóa cho Hệ thống Đặt vé Xem phim CinemaNest (Nhóm 5 - Java Naitei 26).\n\n"
                                + "### Hướng dẫn Test API trên Swagger:\n"
                                + "1. Gọi API `[PUBLIC] Đăng nhập hệ thống` tại mục **01. Xác thực & Tài khoản (Auth)** (đã điền sẵn tài khoản `admin` / `Admin@123456`).\n"
                                + "2. Copy chuỗi `accessToken` nhận được từ phản hồi `200 OK`.\n"
                                + "3. Bấm nút **Authorize (ổ khóa)** màu xanh lá ở góc phải trên cùng, dán token vào ô `Value` và bấm **Authorize**.\n"
                                + "4. Trải nghiệm test các API yêu cầu quyền `[USER]` hoặc `[ADMIN]` với các Example Value mẫu có sẵn.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Nhóm 5 - CinemaNest Team")
                                .email("contact@cinemanest.vn"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort + contextPath)
                                .description("Local Development Server")
                ))
                .tags(List.of(
                        new Tag().name("01. Xác thực & Tài khoản (Auth)").description("Các API đăng ký, đăng nhập, đổi mật khẩu và lấy thông tin tài khoản hiện tại"),
                        new Tag().name("02. Quản lý Người dùng (Users)").description("Các API xem/cập nhật hồ sơ cá nhân và quản trị người dùng (Admin)"),
                        new Tag().name("03. Phim & Thể loại (Movies)").description("Các API tra cứu phim, lọc phim đang chiếu/sắp chiếu và quản trị danh mục phim"),
                        new Tag().name("04. Cụm rạp (Theaters)").description("Các API tra cứu cụm rạp theo khu vực và quản lý thông tin rạp"),
                        new Tag().name("05. Phòng chiếu (Rooms)").description("Các API quản lý danh sách phòng chiếu thuộc từng cụm rạp"),
                        new Tag().name("06. Ghế ngồi (Seats)").description("Các API quản lý cấu hình sơ đồ ghế theo phòng chiếu (Standard, VIP, Sweetbox)"),
                        new Tag().name("07. Suất chiếu (Showtimes)").description("Các API tra cứu lịch chiếu phim và quản lý tạo lịch chiếu"),
                        new Tag().name("08. Trạng thái ghế suất chiếu (Showtime Seats)").description("Các API xem trạng thái ghế theo suất chiếu và giữ ghế tạm thời"),
                        new Tag().name("09. Đồ ăn & Combo (Combos)").description("Các API tra cứu và quản lý danh mục bắp nước, combo ưu đãi"),
                        new Tag().name("10. Đặt vé (Bookings)").description("Các API tạo đơn đặt vé xem phim, xem lịch sử đặt vé cá nhân và quản lý đơn vé"),
                        new Tag().name("11. Thanh toán (Payments)").description("Các API tích hợp cổng thanh toán trực tuyến VNPay, khởi tạo URL thanh toán và xử lý đơn hàng"),
                        new Tag().name("12. Khuyến mãi (Promotions)").description("Các API tra cứu mã giảm giá, kiểm tra tính hợp lệ và quản trị khuyến mãi"),
                        new Tag().name("13. Tin tức (News)").description("Các API xem bài viết tin tức điện ảnh và quản lý bài viết tin tức"),
                        new Tag().name("14. Kiểm thử & Phân quyền (Test RBAC)").description("Các API mẫu để kiểm tra kết nối và cơ chế phân quyền RBAC (Role-Based Access Control)")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT Access Token vào đây (ví dụ: Bearer eyJhbGciOi...)")
                        )
                );
    }
}
