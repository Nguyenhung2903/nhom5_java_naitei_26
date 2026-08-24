package com.nhom_5.server.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Mẫu phản hồi dữ liệu phân trang chuẩn hóa")
public class PageResponse<T> {

    @Schema(description = "Danh sách bản ghi của trang hiện tại")
    private List<T> content;

    @Schema(description = "Số thứ tự trang hiện tại (bắt đầu từ 0)", example = "0")
    private int pageNo;

    @Schema(description = "Kích thước số phần tử mỗi trang", example = "10")
    private int pageSize;

    @Schema(description = "Tổng số bản ghi thỏa mãn điều kiện", example = "100")
    private long totalElements;

    @Schema(description = "Tổng số trang", example = "10")
    private int totalPages;

    @Schema(description = "Trang này có phải là trang cuối cùng không", example = "false")
    private boolean last;

    public static <T> PageResponse<T> fromPage(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
