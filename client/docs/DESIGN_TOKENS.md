# RoGym Design Tokens & Styling Conventions

Tài liệu đặc tả toàn bộ hệ thống Design Tokens (màu sắc, typography, khoảng cách, hiệu ứng bóng đổ, animations) được sử dụng trong RoGym Portable Design System Kit.

---

## 1. Bảng Màu (Color Palette)

### CSS Variables (`styles/tokens.css`)

| Token Name | Hex / Value | Mô tả & Mục đích sử dụng |
| :--- | :--- | :--- |
| `--rogym-green` | `#06c384` | Màu thương hiệu chính, nút bấm primary, hover, focus |
| `--rogym-green-hover` | `#08d891` | Trạng thái hover của nút primary |
| `--rogym-teal` | `#42e09e` | Màu accent thứ hai, đường viền active, eyebrow text |
| `--rogym-green-dark` | `#00492f` | Màu chữ trên nền primary green |
| `--rogym-green-deeper` | `#003d28` | Nền xanh tối sẫm |
| `--rogym-bg-base` | `#080e0b` | Nền trang chính (background) |
| `--rogym-bg-deep` | `#030907` | Nền tối sâu cho drawer hoặc thanh điều hướng |
| `--rogym-bg-card` | `#0f1c16` | Nền thẻ Card tiêu chuẩn |
| `--rogym-bg-card-hover` | `#132218` | Trạng thái hover của thẻ Card |
| `--rogym-bg-elevated` | `#1a2520` | Nền Popover, Modal, Dropdown Select |
| `--rogym-bg-glass` | `rgba(12, 22, 17, 0.82)` | Nền mờ kính mờ (Glassmorphism) |
| `--rogym-text-primary` | `#ffffff` | Màu chữ chính (tiêu đề, nội dung quan trọng) |
| `--rogym-text-secondary` | `#bbcabf` | Màu chữ thứ cấp (body text) |
| `--rogym-text-muted` | `#8ab89c` | Màu chữ mờ (chú thích, nhãn phụ) |
| `--rogym-text-dim` | `rgba(255, 255, 255, 0.45)` | Chữ mờ hơn cho metadata |
| `--rogym-error` | `#ff6b6b` | Màu cảnh báo lỗi, trạng thái nguy hiểm |

---

## 2. Hệ Thống Typography

- **Font chữ chính (Body / UI Text)**: `Be Vietnam Pro`, `sans-serif` (độ dày: 400, 500, 600, 700).
- **Font chữ tiêu đề (Display / Numbers)**: `Anton`, `sans-serif` (dùng cho logo, con số lớn, tiêu đề nổi bật).

### Classes Typography:
- `.rogym-display`: Chữ hoa in đậm, line-height compact (dùng cho hero headings).
- `.rogym-logo`: Chữ hoa có khoảng cách giãn dòng lớn (`letter-spacing: 0.12em`).
- `.rogym-eyebrow`: Nhãn tiêu đề phụ in hoa màu teal (`letter-spacing: 0.28em`, `font-size: 0.75rem`).
- `.rogym-body`: Nội dung đoạn văn (`line-height: 1.7`).

---

## 3. Hệ Thống Đổ Bóng (Shadows) & Glow Effects

| Token | Giá trị CSS | Mục đích |
| :--- | :--- | :--- |
| `--rogym-shadow-primary` | `0 8px 24px -4px rgba(6, 195, 132, 0.3)` | Ánh sáng phát quang cho nút Primary |
| `--rogym-shadow-card` | `0 24px 56px -12px rgba(6, 195, 132, 0.2)` | Đổ bóng nổi cho Card khi hover |
| `--rogym-shadow-glass` | `0 24px 64px rgba(0, 0, 0, 0.55)` | Chiều sâu cho bề mặt kính mờ |

---

## 4. Hiệu Ứng Chuyển Động (Motion & Accessibility)

- **Button Sweep Hover**: Hiệu ứng quét dải sáng mờ từ trái sang phải mượt mà khi hover.
- **Prefers Reduced Motion**: Tự động tắt hoặc giảm thiểu animation (xuống còn 0.01ms) khi hệ điều hành của người dùng bật chế độ giảm tải chuyển động (`prefers-reduced-motion: reduce`).
