package com.nhom_5.server.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 400 Bad Request
    BAD_REQUEST(400, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR(400, "Dữ liệu gửi lên không đúng định dạng", HttpStatus.BAD_REQUEST),
    USERNAME_ALREADY_EXISTS(400, "Tên đăng nhập đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(400, "Email đã được sử dụng bởi một tài khoản khác", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_INCORRECT(400, "Mật khẩu hiện tại không chính xác", HttpStatus.BAD_REQUEST),
    PASSWORDS_DO_NOT_MATCH(400, "Xác nhận mật khẩu mới không khớp", HttpStatus.BAD_REQUEST),

    // 401 Unauthorized
    UNAUTHORIZED(401, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS(401, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN(401, "Token xác thực không hợp lệ hoặc đã bị chỉnh sửa", HttpStatus.UNAUTHORIZED),
    EXPIRED_TOKEN(401, "Token xác thực đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),

    // 403 Forbidden
    FORBIDDEN(403, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED(403, "Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động", HttpStatus.FORBIDDEN),

    // 404 Not Found
    NOT_FOUND(404, "Không tìm thấy tài nguyên yêu cầu", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(404, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR(500, "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
