package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.AdminUpdateUserRequest;
import com.nhom_5.server.dto.request.CreateUserRequest;
import com.nhom_5.server.dto.request.UpdateProfileRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.PageResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Quản lý Người dùng & Hồ sơ (User)", description = "Các API xem/cập nhật hồ sơ cá nhân và CRUD người dùng dành cho Quản trị viên")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(
            summary = "Lấy thông tin hồ sơ của người dùng hiện tại",
            description = "Yêu cầu đính kèm Bearer Token của người dùng đang đăng nhập.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy hồ sơ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa xác thực hoặc token không hợp lệ")
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentProfile() {
        UserProfileDto profile = userService.getCurrentProfile();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin hồ sơ thành công", profile));
    }

    @Operation(
            summary = "Cập nhật thông tin hồ sơ của người dùng hiện tại",
            description = "Cho phép người dùng hiện tại tự cập nhật username, họ tên, số điện thoại, ngày sinh, giới tính và avatar.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật hồ sơ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc username đã tồn tại"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa xác thực hoặc token không hợp lệ")
    })
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateCurrentProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto profile = userService.updateCurrentProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin hồ sơ thành công", profile));
    }

    @Operation(
            summary = "Lấy danh sách người dùng (Dành cho Quản trị viên)",
            description = "Hỗ trợ phân trang, sắp xếp và tìm kiếm theo từ khóa (username, họ tên, email, sđt) kết hợp bộ lọc vai trò, trạng thái.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa xác thực"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserProfileDto>>> getUsers(
            @Parameter(description = "Từ khóa tìm kiếm (username, họ tên, email, sđt)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Lọc theo vai trò người dùng")
            @RequestParam(required = false) Role role,
            @Parameter(description = "Lọc theo trạng thái tài khoản")
            @RequestParam(required = false) UserStatus status,
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số bản ghi trên mỗi trang")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường sắp xếp")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Chiều sắp xếp (asc hoặc desc)")
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<UserProfileDto> result = userService.getUsers(keyword, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", result));
    }

    @Operation(
            summary = "Lấy thông tin chi tiết một người dùng theo ID (Admin)",
            description = "Tra cứu thông tin người dùng dựa trên UUID.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserById(@PathVariable UUID id) {
        UserProfileDto profile = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", profile));
    }

    @Operation(
            summary = "Tạo mới tài khoản người dùng từ trang Quản trị (Admin)",
            description = "Admin tạo tài khoản với vai trò (USER, ADMIN) và trạng thái chỉ định.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo người dùng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc username/email đã tồn tại"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<UserProfileDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserProfileDto createdUser = userService.createUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo người dùng mới thành công", createdUser));
    }

    @Operation(
            summary = "Cập nhật thông tin người dùng (Admin)",
            description = "Admin cập nhật thông tin, vai trò, trạng thái hoặc đặt lại mật khẩu cho người dùng.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc username bị trùng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        UserProfileDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", updatedUser));
    }

    @Operation(
            summary = "Xóa mềm / Khóa tài khoản người dùng (Admin)",
            description = "Chuyển trạng thái người dùng thành LOCKED để vô hiệu hóa tài khoản và bảo toàn toàn vẹn dữ liệu.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa người dùng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công", null));
    }
}
