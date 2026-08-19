# Movie Ticket Booking - Backend (Server)

> Dự án Backend cho hệ thống Đặt vé xem phim (**Movie Ticket Booking**) - Nhóm 5, khóa học Sun* Java NAITEI 26.

---

## Mục Lục
1. [Giới Thiệu & Công Nghệ](#giới-thiệu--công-nghệ)
2. [Yêu Cầu Môi Trường](#yêu-cầu-môi-trường)
3. [Cấu Hình Cơ Sở Dữ Liệu & Biến Môi Trường (JWT / Supabase)](#cấu-hình-cơ-sở-dữ-liệu--biến-môi-trường-jwt--supabase)
4. [Hướng Dẫn Khởi Chạy & Biên Dịch](#hướng-dẫn-khởi-chạy--biên-dịch)
5. [Tài Khoản Mẫu & Khởi Tạo Dữ Liệu (Seed Data)](#tài-khoản-mẫu--khởi-tạo-dữ-liệu-seed-data)
6. [Danh Mục API Xác Thực & Phân Quyền Đã Triển Khai](#danh-mục-api-xác-thực--phân-quyền-đã-triển-khai)
7. [Kiến Trúc Phân Tầng (Package Architecture)](#kiến-trúc-phân-tầng-package-architecture)
8. [Quy Chuẩn Thiết Kế RESTful API & Error Handling](#quy-chuẩn-thiết-kế-restful-api--error-handling)
9. [Cơ Chế Bảo Mật, JWT & Phân Quyền (RBAC)](#cơ-chế-bảo-mật-jwt--phân-quyền-rbac)
10. [Tích Hợp & Sử Dụng Swagger / OpenAPI (Bearer JWT)](#tích-hợp--sử-dụng-swagger--openapi-bearer-jwt)
11. [Hướng Dẫn Thêm Mới Một Tính Năng Hoàn Chỉnh (Full Flow)](#hướng-dẫn-thêm-mới-một-tính-năng-hoàn-chỉnh-full-flow)
12. [Quy Chuẩn Code & Quy Ước Sun* NAITEI 26 / Redmine](#quy-chuẩn-code--quy-ước-sun-naitei-26--redmine)

---

## Giới Thiệu & Công Nghệ

Backend cung cấp hệ thống RESTful API an toàn, hiệu năng cao phục vụ cho nghiệp vụ đặt vé xem phim:

- **Ngôn ngữ**: [Java 21 (LTS)](https://openjdk.org/projects/jdk/21/)
- **Framework**: [Spring Boot 4.1.0](https://spring.io/projects/spring-boot)
- **Data Persistence**: Spring Data JPA + [Hibernate ORM](https://hibernate.org/orm/) (Khóa chính UUID)
- **Database**: [PostgreSQL (Supabase Cloud Database)](https://supabase.com/)
- **Bảo mật & Phân quyền**: [Spring Security](https://spring.io/projects/spring-security) (Stateless JWT Authentication & Method Security RBAC)
- **JWT Library**: JJWT (`io.jsonwebtoken:jjwt-api:0.12.6`)
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Code Generation**: [Project Lombok](https://projectlombok.org/)
- **Build Tool**: Apache Maven (kèm Maven Wrapper `mvnw`)
- **API Documentation**: OpenAPI 3 / Swagger UI (kèm tích hợp Bearer JWT Authorization)

---

## Yêu Cầu Môi Trường

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

## Cấu Hình Cơ Sở Dữ Liệu & Biến Môi Trường (JWT / Supabase)

Dự án sử dụng cơ sở dữ liệu PostgreSQL trên nền tảng đám mây **Supabase**. Để bảo mật thông tin mật khẩu, các cấu hình nhạy cảm được tách biệt và **không** đưa lên Git.

### 1. File cấu hình chính: `src/main/resources/application.yaml`
```yaml
server:
  port: ${PORT:8080}
  servlet:
    context-path: /api

spring:
  application:
    name: server

  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require}
    username: ${SPRING_DATASOURCE_USERNAME:postgres.uuqydetbopbuvutpxhbh}
    password: ${DB_PASSWORD:[YOUR-PASSWORD]}
    driver-class-name: org.postgresql.Driver

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: ${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
    show-sql: ${SPRING_JPA_SHOW_SQL:true}
    open-in-view: false

app:
  cors:
    allowed-origins: "http://localhost:5173,http://127.0.0.1:5173"
  swagger:
    auto-open: ${APP_SWAGGER_AUTO_OPEN:true}
  jwt:
    # Chuỗi Secret Key an toàn tối thiểu 256 bits cho thuật toán HMAC-SHA256
    secret: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
    # Thời hạn hiệu lực Access Token: 7 ngày (604800000 ms)
    expiration-ms: ${JWT_EXPIRATION_MS:604800000}
  init-admin:
    enabled: ${INIT_ADMIN_ENABLED:true}
    username: ${INIT_ADMIN_USERNAME:admin}
    password: ${INIT_ADMIN_PASSWORD:Admin@123456}
    email: ${INIT_ADMIN_EMAIL:admin@cinemanest.vn}
    full-name: ${INIT_ADMIN_FULLNAME:System Administrator}
```

### 2. Thiết lập Biến Môi Trường khi chạy Local
- **Windows (PowerShell)**:
  ```powershell
  $env:DB_PASSWORD="<YOUR_SUPABASE_PASSWORD>"
  ```
- **Linux / macOS**:
  ```bash
  export DB_PASSWORD="<YOUR_SUPABASE_PASSWORD>"
  ```

---

## Hướng Dẫn Khởi Chạy & Biên Dịch

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

Khi khởi động thành công:
- **Base API URL**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/api/swagger-ui/index.html`
- **OpenAPI JSON Spec**: `http://localhost:8080/api/v3/api-docs`

### 2. Các câu lệnh Maven quan trọng
| Câu lệnh | Mục đích |
| :--- | :--- |
| `.\mvnw.cmd clean compile` | Dọn dẹp và biên dịch mã nguồn Java |
| `.\mvnw.cmd test` | Chạy toàn bộ Unit Test và Integration Test |
| `.\mvnw.cmd clean package -DskipTests` | Đóng gói mã nguồn thành file `.jar` trong thư mục `target/` |
| `java -jar target/server-0.0.1-SNAPSHOT.jar` | Chạy file JAR đã đóng gói |

---

## Tài Khoản Mẫu & Khởi Tạo Dữ Liệu (Seed Data)

Khi ứng dụng khởi động, lớp `DataInitializer` sẽ tự động kiểm tra và tạo 2 tài khoản mẫu nếu cơ sở dữ liệu chưa tồn tại:

| Tài khoản | Username | Email | Mật khẩu mặc định | Vai trò (Role) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin@cinemanest.vn` | `Admin@123456` | `ADMIN` | `ACTIVE` |
| **Người dùng mẫu** | `user` | `user@cinemanest.vn` | `User@123456` | `USER` | `ACTIVE` |

---

## Danh Mục API Xác Thực & Phân Quyền Đã Triển Khai

| STT | HTTP Method | Đường dẫn API | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/auth/register` | **Public** | Đăng ký tài khoản khách hàng mới (mặc định Role `USER`, Status `ACTIVE`) |
| 2 | `POST` | `/api/auth/login` | **Public** | Đăng nhập bằng Username HOẶC Email kèm Password -> nhận JWT Token |
| 3 | `GET` | `/api/auth/me` | **Authenticated** | Lấy thông tin cá nhân của tài khoản đang đăng nhập |
| 4 | `POST` | `/api/auth/change-password` | **Authenticated** | Đổi mật khẩu tài khoản hiện tại |
| 5 | `GET` | `/api/test/ping` | **Public** | Kiểm tra kết nối Backend & CORS |
| 6 | `GET` | `/api/test/public` | **Public** | Endpoint công khai mẫu |
| 7 | `GET` | `/api/test/user-only` | **USER** hoặc **ADMIN** | Endpoint yêu cầu đăng nhập |
| 8 | `GET` | `/api/test/admin-only` | **ADMIN** | Endpoint chỉ Quản trị viên mới truy cập được (trả về 403 nếu là USER) |

---

## Kiến Trúc Phân Tầng (Package Architecture)

Dự án áp dụng mô hình kiến trúc phân lớp chuẩn (Layered Architecture):

```
server/src/main/java/com/nhom_5/server/
├── config/                  # Các lớp cấu hình hệ thống
│   ├── CorsConfig.java               # Cấu hình CORS cho React Client
│   ├── SecurityConfig.java           # Cấu hình Spring Security & Phân quyền
│   ├── OpenApiConfig.java            # Cấu hình Swagger OpenAPI & Bearer JWT
│   ├── JpaAuditingConfig.java        # Tự động gán created_at / updated_at
│   ├── SwaggerAutoOpenListener.java  # Tự động mở Swagger UI khi dev
│   └── DataInitializer.java          # Seed tài khoản Admin & User mẫu
├── controller/              # Tầng Controller (Tiếp nhận HTTP Request, gọi Service)
│   ├── AuthController.java           # API Đăng ký, Đăng nhập, Profile, Đổi mật khẩu
│   └── TestController.java           # API Kiểm thử kết nối & Phân quyền RBAC
├── dto/                     # Data Transfer Objects
│   ├── request/                      # DTO nhận từ Client
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   └── ChangePasswordRequest.java
│   └── response/                     # DTO trả về cho Client
│       ├── ApiResponse.java          # Wrapper JSON chuẩn toàn hệ thống
│       ├── FieldErrorDto.java        # Chi tiết lỗi Validation từng trường
│       ├── UserProfileDto.java       # Thông tin User an toàn (không lộ pass)
│       └── AuthResponse.java         # DTO chứa JWT Access Token & User Profile
├── entity/                  # JPA Entities (Ánh xạ các bảng trong PostgreSQL)
│   ├── BaseEntity.java               # Lớp cha chứa id (UUID), createdAt, updatedAt
│   ├── User.java                     # Entity người dùng
│   ├── Movie.java, Booking.java...   # Các entity nghiệp vụ đặt vé
│   └── enums/                        # Các enum quản lý trạng thái/vai trò
│       ├── Role.java                 # ADMIN, USER
│       └── UserStatus.java           # ACTIVE, LOCKED
├── exception/               # Xử lý ngoại lệ tập trung toàn ứng dụng
│   ├── ErrorCode.java                # Enum quản lý mã lỗi, thông điệp & HTTP status
│   ├── AppException.java             # Custom RuntimeException cho lỗi nghiệp vụ
│   └── GlobalExceptionHandler.java   # @RestControllerAdvice bắt tất cả ngoại lệ
├── repository/              # Tầng tương tác CSDL (Spring Data JPA)
│   └── UserRepository.java
├── security/                # Các thành phần cốt lõi của Spring Security & JWT
│   ├── JwtService.java               # Sinh, trích xuất Claims & validate JWT Token
│   ├── CustomUserDetails.java        # Wrapper User entity cho Spring Security
│   ├── CustomUserDetailsService.java # Load user bằng Username hoặc Email
│   ├── JwtAuthenticationFilter.java  # Filter kiểm tra header Bearer Token
│   ├── JwtAuthenticationEntryPoint.java # Xử lý lỗi 401 Unauthorized JSON chuẩn
│   └── JwtAccessDeniedHandler.java   # Xử lý lỗi 403 Forbidden JSON chuẩn
├── service/                 # Tầng xử lý nghiệp vụ (Business Logic)
│   ├── AuthService.java
│   └── impl/
│       └── AuthServiceImpl.java
├── util/                    # Các lớp tiện ích dùng chung
│   └── SecurityUtil.java             # Helper static lấy User/UserId đang đăng nhập
└── ServerApplication.java   # Main Class khởi động Spring Boot
```

---

## Quy Chuẩn Thiết Kế RESTful API & Error Handling

Mọi Developer tham gia phát triển đều **bắt buộc tuân theo các quy chuẩn** dưới đây:

### 1. Cấu trúc JSON Response chuẩn (`ApiResponse<T>`)
Mọi API trả về bắt buộc được bọc trong class `ApiResponse<T>`:

#### Thành công (HTTP 200 / 201):
```json
{
  "code": 200,
  "status": "SUCCESS",
  "message": "Thành công",
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "title": "Avengers: Secret Wars"
  },
  "timestamp": "2026-08-19T08:23:24Z"
}
```

#### Thất bại / Lỗi nghiệp vụ (HTTP 400, 401, 403, 404, 500):
```json
{
  "code": 400,
  "status": "ERROR",
  "message": "Tên đăng nhập đã tồn tại trong hệ thống",
  "timestamp": "2026-08-19T08:23:24Z"
}
```

#### Lỗi Validation dữ liệu DTO (`@Valid` thất bại):
```json
{
  "code": 400,
  "status": "ERROR",
  "message": "Dữ liệu gửi lên không đúng định dạng",
  "errors": [
    {
      "field": "email",
      "message": "Email không đúng định dạng"
    },
    {
      "field": "password",
      "message": "Mật khẩu phải có độ dài từ 6 ký tự trở lên"
    }
  ],
  "timestamp": "2026-08-19T08:23:24Z"
}
```

---

### 2. Quy tắc Viết Controller
```java
@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(@PathVariable UUID id) {
        MovieResponse response = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phim thành công", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@Valid @RequestBody MovieCreateRequest request) {
        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo phim mới thành công", response));
    }
}
```

---

### 3. Xử lý Ngoại lệ bằng `AppException` & `ErrorCode`
Tuyệt đối **không** dùng `try-catch` để nuốt lỗi hoặc trả về chuỗi lỗi thủ công trong Controller. Hãy ném ra `AppException`:

```java
// Khi không tìm thấy dữ liệu:
throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng chiếu với ID: " + roomId);

// Khi vi phạm logic nghiệp vụ:
throw new AppException(ErrorCode.BAD_REQUEST, "Suất chiếu đã diễn ra, không thể hủy vé");
```

---

## Cơ Chế Bảo Mật, JWT & Phân Quyền (RBAC)

Hệ thống áp dụng mô hình xác thực **Stateless JWT**:
- Client gửi Token qua HTTP Header: `Authorization: Bearer <access_token>`
- Hệ thống hỗ trợ 2 vai trò chuẩn: `ADMIN` và `USER`.

### 1. Phân quyền Endpoint bằng `@PreAuthorize`
Lập trình viên sử dụng `@PreAuthorize` trực tiếp trên các phương thức của Controller:

- **Chỉ ADMIN mới được thao tác** (Thêm/Sửa/Xóa dữ liệu danh mục):
  ```java
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/movies")
  public ResponseEntity<ApiResponse<MovieResponse>> createMovie(...)
  ```
- **Cả USER và ADMIN đều được thao tác** (Đặt vé, xem thông tin cá nhân):
  ```java
  @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
  @PostMapping("/bookings")
  public ResponseEntity<ApiResponse<BookingResponse>> createBooking(...)
  ```

---

### 2. Lấy thông tin Người dùng hiện tại qua `SecurityUtil`
Không cần truyền User object qua Controller hoặc DTO, bất kỳ Service/Controller nào cũng có thể gọi:

```java
import com.nhom_5.server.util.SecurityUtil;

// 1. Lấy ID người dùng đang đăng nhập (UUID):
UUID currentUserId = SecurityUtil.getCurrentUserId();

// 2. Lấy đối tượng User Entity đầy đủ:
User currentUser = SecurityUtil.getCurrentUser();

// 3. Lấy Username hoặc Email:
String username = SecurityUtil.getCurrentUsername();
String email = SecurityUtil.getCurrentUserEmail();

// 4. Kiểm tra xem người dùng hiện tại có phải là Admin không:
if (SecurityUtil.isAdmin()) {
    // Xử lý logic dành riêng cho Admin
}
```

---

## Tích Hợp & Sử Dụng Swagger / OpenAPI (Bearer JWT)

Để kiểm thử trực tiếp các API bảo mật trên Swagger UI:

1. Mở trình duyệt và truy cập: **`http://localhost:8080/api/swagger-ui/index.html`**
2. Thực hiện gọi API `POST /auth/login` với body:
   ```json
   {
     "usernameOrEmail": "admin",
     "password": "Admin@123456"
   }
   ```
3. Copy chuỗi `accessToken` từ phản hồi `data.accessToken`.
4. Nhấn nút **Authorize (biểu tượng ổ khóa màu xanh)** ở góc trên bên phải màn hình Swagger.
5. Dán mã token vào ô `Value` và nhấn **Authorize** -> **Close**.
6. Lúc này toàn bộ các API có ổ khóa (`/api/auth/me`, `/api/test/admin-only`, ...) đều sẽ tự động gửi kèm Header `Authorization: Bearer <token>`.

---

## Hướng Dẫn Thêm Mới Một Tính Năng Hoàn Chỉnh (Full Flow)

Quy trình 6 bước chuẩn để tạo một chức năng mới (Ví dụ: Module **Movie**):

### Bước 1: Tạo Entity kế thừa `BaseEntity` (`entity/Movie.java`)
```java
package com.nhom_5.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Movie extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster_url")
    private String posterUrl;
}
```

### Bước 2: Tạo Repository với UUID (`repository/MovieRepository.java`)
```java
package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MovieRepository extends JpaRepository<Movie, UUID> {
    List<Movie> findByTitleContainingIgnoreCase(String title);
}
```

### Bước 3: Tạo DTOs (`dto/request/` và `dto/response/`)
```java
// dto/request/MovieCreateRequest.java
package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MovieCreateRequest {

    @NotBlank(message = "Tên phim không được để trống")
    @Schema(description = "Tên bộ phim", example = "Avatar 3: Fire and Ash")
    private String title;

    private String description;

    @Positive(message = "Thời lượng phim phải lớn hơn 0")
    private Integer durationMinutes;

    private LocalDate releaseDate;
    private String posterUrl;
}
```

```java
// dto/response/MovieResponse.java
package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Movie;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class MovieResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private LocalDate releaseDate;
    private String posterUrl;

    public static MovieResponse fromEntity(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .durationMinutes(movie.getDurationMinutes())
                .releaseDate(movie.getReleaseDate())
                .posterUrl(movie.getPosterUrl())
                .build();
    }
}
```

### Bước 4: Tạo Service Interface & Service Implementation (`service/`)
```java
// service/MovieService.java
package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.MovieCreateRequest;
import com.nhom_5.server.dto.response.MovieResponse;

import java.util.List;
import java.util.UUID;

public interface MovieService {
    List<MovieResponse> getAllMovies();
    MovieResponse getMovieById(UUID id);
    MovieResponse createMovie(MovieCreateRequest request);
}
```

```java
// service/impl/MovieServiceImpl.java
package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.MovieCreateRequest;
import com.nhom_5.server.dto.response.MovieResponse;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(MovieResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(UUID id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + id));
        return MovieResponse.fromEntity(movie);
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieCreateRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .releaseDate(request.getReleaseDate())
                .posterUrl(request.getPosterUrl())
                .build();

        return MovieResponse.fromEntity(movieRepository.save(movie));
    }
}
```

### Bước 5: Tạo Controller với OpenAPI & `@PreAuthorize` (`controller/MovieController.java`)
```java
package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.MovieCreateRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.MovieResponse;
import com.nhom_5.server.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Quản lý Phim (Movies)", description = "Các API truy vấn và quản lý danh mục phim")
@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @Operation(summary = "Lấy danh sách tất cả phim (Công khai)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getAllMovies() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim thành công", movieService.getAllMovies()));
    }

    @Operation(summary = "Lấy chi tiết phim theo ID (Công khai)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(movieService.getMovieById(id)));
    }

    @Operation(
            summary = "Thêm phim mới (Chỉ Quản trị viên)",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@Valid @RequestBody MovieCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Thêm phim mới thành công", movieService.createMovie(request)));
    }
}
```

---

## 📌 Quy Chuẩn Code & Quy Ước Sun* NAITEI 26 / Redmine

1. **Lombok & Clean Architecture**:
   - Sử dụng `@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@SuperBuilder` / `@Builder`.
   - Luôn thêm `@Transactional(readOnly = true)` cho các phương thức đọc dữ liệu để tối ưu hiệu năng JPA.
2. **Quy tắc tạo nhánh (Branch)**:
   - Cú pháp: `feature/<ticket-id>-<tên-ngắn-gọn>` (ví dụ: `feature/1234-movie-crud-api`).
   - Sửa lỗi: `bugfix/<ticket-id>-<tên-ngắn-gọn>`.
3. **Quy tắc Commit Message**:
   - Ghi mã ticket đầu commit: `git commit -m "#1234 Implement Movie CRUD API with RBAC security"`.
4. **Quy tắc Pull Request**:
   - Tiêu đề PR bắt đầu bằng mã ticket: `#1234 Implement Movie Service and Controller`.
   - Nội dung PR phải có link ticket Redmine tương ứng: `https://edu-redmine.sun-asterisk.vn/issues/1234`.
   - Yêu cầu ít nhất 1 thành viên review và approve trước khi merge vào nhánh chính.
