# 🎬 Movie Ticket Booking - Backend (Server)

> Dự án Backend cho hệ thống Đặt vé xem phim (**Movie Ticket Booking**) - Nhóm 5, khóa học Sun* Java NAITEI 26.

---

## 📑 Mục Lục
1. [Giới Thiệu & Công Nghệ](#-giới-thiệu--công-nghệ)
2. [Yêu Cầu Môi Trường](#-yêu-cầu-môi-trường)
3. [Cấu Hình Cơ Sở Dữ Liệu Supabase (PostgreSQL)](#-cấu-hình-cơ-sở-dữ-liệu-supabase-postgresql)
4. [Hướng Dẫn Khởi Chạy & Biên Dịch](#-hướng-dẫn-khởi-chạy--biên-dịch)
5. [Kiến Trúc Phân Tầng (Package Architecture)](#-kiến-trúc-phân-tầng-package-architecture)
6. [Quy Chuẩn Thiết Kế RESTful API](#-quy-chuẩn-thiết-kế-restful-api)
7. [Cấu Hình CORS & Spring Security](#-cấu-hình-cors--spring-security)
8. [Tích Hợp & Sử Dụng Swagger / OpenAPI](#-tích-hợp--sử-dụng-swagger--openapi)
9. [Hướng Dẫn Thêm Mới Một Chức Năng Hoàn Chỉnh (Full Flow)](#-hướng-dẫn-thêm-mới-một-chức-năng-hoàn-chỉnh-full-flow)
10. [Quy Chuẩn Code & Quy Ước Sun* NAITEI 26 / Redmine](#-quy-chuẩn-code--quy-ước-sun-naitei-26--redmine)

---

## 🚀 Giới Thiệu & Công Nghệ

Backend cung cấp hệ thống RESTful API an toàn, hiệu năng cao phục vụ cho nghiệp vụ đặt vé xem phim:

- **Ngôn ngữ**: [Java 21 (LTS)](https://openjdk.org/projects/jdk/21/)
- **Framework**: [Spring Boot 4.1.0](https://spring.io/projects/spring-boot)
- **Data Persistence**: Spring Data JPA + [Hibernate ORM](https://hibernate.org/orm/)
- **Database**: [PostgreSQL (Supabase Cloud Database)](https://supabase.com/)
- **Security**: [Spring Security](https://spring.io/projects/spring-security)
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Code Generation**: [Project Lombok](https://projectlombok.org/)
- **Build Tool**: Apache Maven (kèm Maven Wrapper `mvnw`)
- **API Documentation**: OpenAPI 3 / Swagger UI

---

## 💻 Yêu Cầu Môi Trường

Trước khi phát triển, máy tính cần được cài đặt:
- **Java Development Kit (JDK)**: Phiên bản **Java 21** ([Eclipse Temurin 21](https://adoptium.net/) hoặc OpenJDK 21).
- **IDE Khuyến nghị**: IntelliJ IDEA (khuyên dùng), VS Code với Extension Pack for Java, hoặc Eclipse/STS.
- **Git**: Đã cấu hình username và email theo quy định.

Kiểm tra phiên bản Java trên terminal:
```bash
java -version
```
*(Kết quả cần hiển thị `openjdk version "21.x.x"` hoặc `java version "21.x.x"`)*

---

## 🗄️ Cấu Hình Cơ Sở Dữ Liệu Supabase (PostgreSQL)

Dự án sử dụng cơ sở dữ liệu PostgreSQL lưu trữ trên nền tảng đám mây **Supabase**. Để bảo mật thông tin mật khẩu, các cấu hình nhạy cảm được tách biệt và **không** đưa lên Git.

### 1. Lấy thông tin kết nối từ Supabase Dashboard
1. Truy cập vào dự án trên [Supabase Dashboard](https://supabase.com/dashboard).
2. Vào mục **Project Settings** -> **Database**.
3. Tại phần **Connection string**, chọn tab **URI** hoặc **JDBC**:
   - Sử dụng cổng `5432` (Direct / Session Pooler) hoặc `6543` (Transaction Pooler).
   - URL mẫu: `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`
   - Username mẫu: `postgres.<PROJECT_REF>` hoặc `postgres`
   - Password: Mật khẩu database đã tạo khi khởi tạo Supabase.

---

### 2. Cách 1: Sử dụng file `application-local.yaml` (Khuyến nghị cho Local Dev)
Trong thư mục `server/src/main/resources/`, tạo file `application-local.yaml` bằng cách sao chép từ file mẫu `application-local.yaml.example`:

- **Windows (PowerShell)**:
  ```powershell
  cd server/src/main/resources
  Copy-Item application-local.yaml.example application-local.yaml
  ```
- **macOS / Linux / Git Bash**:
  ```bash
  cd server/src/main/resources
  cp application-local.yaml.example application-local.yaml
  ```

Nội dung file `application-local.yaml`:
```yaml
spring:
  config:
    activate:
      on-profile: local

  datasource:
    url: jdbc:postgresql://<SUPABASE_HOST>:<PORT>/postgres?sslmode=require
    username: postgres.<PROJECT_REF>
    password: <YOUR_SUPABASE_PASSWORD>
    driver-class-name: org.postgresql.Driver

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: update # Tự động tạo / cập nhật bảng trong giai đoạn dev
    show-sql: true
    properties:
      hibernate:
        format_sql: true

app:
  cors:
    allowed-origins: "http://localhost:5173,http://127.0.0.1:5173"
```
> ⚠️ **Lưu ý**: File `application-local.yaml` đã được thêm vào `.gitignore`, an toàn không bị lộ mật khẩu lên GitHub.

---

### 3. Cách 2: Thiết lập qua Biến Môi Trường (Environment Variables)
Nếu không dùng file local, bạn có thể thiết lập biến môi trường trước khi chạy:
- **Windows (PowerShell)**:
  ```powershell
  $env:SPRING_DATASOURCE_URL="jdbc:postgresql://<HOST>:<PORT>/postgres?sslmode=require"
  $env:SPRING_DATASOURCE_USERNAME="postgres.<PROJECT_REF>"
  $env:SPRING_DATASOURCE_PASSWORD="<YOUR_PASSWORD>"
  ```
- **Linux / macOS**:
  ```bash
  export SPRING_DATASOURCE_URL="jdbc:postgresql://<HOST>:<PORT>/postgres?sslmode=require"
  export SPRING_DATASOURCE_USERNAME="postgres.<PROJECT_REF>"
  export SPRING_DATASOURCE_PASSWORD="<YOUR_PASSWORD>"
  ```

---

## 🛠️ Hướng Dẫn Khởi Chạy & Biên Dịch

Mọi thao tác đều thực hiện từ thư mục `server/`.

### 1. Khởi chạy Server ở chế độ Development

- **Windows (CMD / PowerShell)**:
  ```powershell
  cd server
  .\mvnw.cmd spring-boot:run
  ```
- **Linux / macOS**:
  ```bash
  cd server
  ./mvnw spring-boot:run
  ```
- **Chỉ định Profile Local**:
  ```bash
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
  ```

Khi khởi động thành công, server sẽ lắng nghe tại: **`http://localhost:8080`**

### 2. Các câu lệnh Maven quan trọng
| Câu lệnh | Mục đích |
| :--- | :--- |
| `.\mvnw.cmd clean compile` | Dọn dẹp và biên dịch mã nguồn Java |
| `.\mvnw.cmd test` | Chạy toàn bộ Unit Test và Integration Test |
| `.\mvnw.cmd clean package -DskipTests` | Đóng gói mã nguồn thành file `.jar` trong thư mục `target/` |
| `java -jar target/server-0.0.1-SNAPSHOT.jar` | Chạy file JAR đã đóng gói |

---

## 🏗️ Kiến Trúc Phân Tầng (Package Architecture)

Dự án áp dụng mô hình kiến trúc phân lớp chuẩn (Layered Architecture):

```
server/src/main/java/com/nhom_5/server/
├── config/                  # Các lớp cấu hình hệ thống (Security, CORS, Swagger, JPA Auditing...)
│   ├── CorsConfig.java
│   ├── SecurityConfig.java
│   └── OpenApiConfig.java
├── controller/              # Tầng Controller (Tiếp nhận HTTP Request, gọi Service và trả về DTO)
│   ├── MovieController.java
│   └── BookingController.java
├── dto/                     # Data Transfer Objects (Request / Response DTOs)
│   ├── request/             # DTO nhận từ client (MovieCreateRequest, BookingRequest...)
│   └── response/            # DTO trả về cho client (MovieResponse, ApiResponse...)
├── entity/                  # JPA Entities (Ánh xạ các bảng trong cơ sở dữ liệu)
│   ├── Movie.java
│   ├── Cinema.java
│   ├── Showtime.java
│   ├── Seat.java
│   ├── Ticket.java
│   └── User.java
├── exception/               # Xử lý ngoại lệ tập trung (Global Exception Handler & Custom Errors)
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── AppException.java
├── repository/             # Tầng tương tác CSDL (Kế thừa JpaRepository)
│   ├── MovieRepository.java
│   └── TicketRepository.java
├── service/                 # Tầng xử lý nghiệp vụ (Business Logic)
│   ├── MovieService.java
│   └── impl/
│       └── MovieServiceImpl.java
└── ServerApplication.java   # Main Class khởi động Spring Boot
```

---

## 📡 Quy Chuẩn Thiết Kế RESTful API

### 1. Cấu trúc JSON Response thống nhất (`ApiResponse<T>`)
Mọi API trả về đều phải được bọc trong một chuẩn Response chung để Frontend dễ dàng xử lý:

```json
{
  "code": 200,
  "message": "Lấy thông tin thành công",
  "data": {
    "id": 1,
    "title": "Avengers: Secret Wars",
    "durationMinutes": 150
  },
  "timestamp": "2026-08-19T12:00:00"
}
```

Mẫu Class `ApiResponse.java`:
```java
package com.nhom_5.server.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message("Success")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .build();
    }
}
```

### 2. Chuẩn đặt tên Endpoints & HTTP Methods
- **Resource Naming**: Dùng danh từ số nhiều, chữ thường, nối từ bằng dấu gạch ngang (`kebab-case`).
- **Phiên bản API**: Tiền tố `/api/v1/`

| HTTP Method | Endpoint mẫu | Mô tả hành động |
| :--- | :--- | :--- |
| `GET` | `/api/v1/movies` | Lấy danh sách phim (kèm phân trang/lọc) |
| `GET` | `/api/v1/movies/{id}` | Lấy chi tiết phim theo ID |
| `POST` | `/api/v1/movies` | Tạo mới một bộ phim |
| `PUT` | `/api/v1/movies/{id}` | Cập nhật toàn bộ thông tin phim |
| `PATCH` | `/api/v1/movies/{id}` | Cập nhật một phần thông tin phim |
| `DELETE` | `/api/v1/movies/{id}` | Xóa phim |

---

## 🔒 Cấu Hình CORS & Spring Security

Để Client (Vite React tại `http://localhost:5173`) có thể gọi các API trên Server mà không bị trình duyệt chặn CORS:

### 1. Lớp Cấu hình CORS (`CorsConfig.java`)
```java
package com.nhom_5.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 2. Cấu hình Spring Security (`SecurityConfig.java`)
```java
package com.nhom_5.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Cho phép truy cập công khai API phim, swagger, public routes
                .requestMatchers("/api/v1/movies/**", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Các endpoint yêu cầu xác thực
                .anyRequest().permitAll() // Hoặc .authenticated() khi tích hợp JWT
            );

        return http.build();
    }
}
```

---

## 📖 Tích Hợp & Sử Dụng Swagger / OpenAPI

Để test các API trực quan trên trình duyệt:

1. Thêm dependency vào `pom.xml` (nếu chưa có):
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.5</version>
</dependency>
```

2. Truy cập tài liệu giao diện Swagger UI:
- **Swagger UI**: **`http://localhost:8080/swagger-ui.html`**
- **OpenAPI JSON Docs**: **`http://localhost:8080/v3/api-docs`**

---

## 🔄 Hướng Dẫn Thêm Mới Một Chức Năng Hoàn Chỉnh (Full Flow)

Quy trình 6 bước chuẩn để tạo tính năng mới (Ví dụ: Module **Movie**):

### Bước 1: Tạo Entity (`entity/Movie.java`)
```java
package com.nhom_5.server.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer durationMinutes;

    private LocalDate releaseDate;

    private String posterUrl;
}
```

### Bước 2: Tạo Repository (`repository/MovieRepository.java`)
```java
package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByTitleContainingIgnoreCase(String title);
}
```

### Bước 3: Tạo DTOs (`dto/`)
```java
package com.nhom_5.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MovieCreateRequest {
    @NotBlank(message = "Tên phim không được để trống")
    private String title;

    private String description;

    @Positive(message = "Thời lượng phim phải lớn hơn 0")
    private Integer durationMinutes;

    private LocalDate releaseDate;
    private String posterUrl;
}
```

### Bước 4: Tạo Service Interface & Implementation (`service/`)
```java
// service/MovieService.java
package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.MovieCreateRequest;
import com.nhom_5.server.entity.Movie;
import java.util.List;

public interface MovieService {
    List<Movie> getAllMovies();
    Movie getMovieById(Long id);
    Movie createMovie(MovieCreateRequest request);
}
```

```java
// service/impl/MovieServiceImpl.java
package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.MovieCreateRequest;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.exception.ResourceNotFoundException;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim với ID: " + id));
    }

    @Override
    @Transactional
    public Movie createMovie(MovieCreateRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .releaseDate(request.getReleaseDate())
                .posterUrl(request.getPosterUrl())
                .build();
        return movieRepository.save(movie);
    }
}
```

### Bước 5: Tạo Controller (`controller/MovieController.java`)
```java
package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.MovieCreateRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Movie>>> getAllMovies() {
        List<Movie> movies = movieService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim thành công", movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> getMovieById(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success(movie));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Movie>> createMovie(@Valid @RequestBody MovieCreateRequest request) {
        Movie createdMovie = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phim mới thành công", createdMovie));
    }
}
```

### Bước 6: Xử lý ngoại lệ tập trung (`exception/GlobalExceptionHandler.java`)
```java
package com.nhom_5.server.exception;

import com.nhom_5.server.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message(errorMsg)
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Đã xảy ra lỗi hệ thống: " + ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

---

## 📌 Quy Chuẩn Code & Quy Ước Sun* NAITEI 26 / Redmine

1. **Lombok & Code Cleanliness**:
   - Sử dụng `@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@Builder` thay cho getter/setter thủ công.
   - Luôn sử dụng `@Transactional(readOnly = true)` cho các hàm truy vấn để tối ưu hiệu năng.
2. **Quy tắc tạo nhánh (Branch)**:
   - Cú pháp: `feature/<ticket-id>-<tên-ngắn-gọn>` (ví dụ: `feature/1234-movie-crud-api`).
   - Sửa lỗi: `bugfix/<ticket-id>-<tên-ngắn-gọn>`.
3. **Quy tắc Commit Message**:
   - Ghi mã ticket đầu commit: `git commit -m "#1234 Implement Movie CRUD API and Global Exception Handler"`.
4. **Quy tắc Pull Request**:
   - Tiêu đề PR bắt đầu bằng mã ticket: `#1234 Implement Movie Service and Controller`.
   - Nội dung PR phải có link ticket Redmine tương ứng: `https://edu-redmine.sun-asterisk.vn/issues/1234`.
   - Yêu cầu ít nhất 1 thành viên review và approve trước khi merge vào nhánh chính.
