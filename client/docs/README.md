# RoGym Portable Design System Kit

> **Bộ Design System Kit độc lập, chuẩn Production, dành cho React & Tailwind CSS.**

---

## 📚 Mục Lục Tài Liệu Hướng Dẫn

1. 🚀 **[Hướng Dẫn Tích Hợp 3 Bước (`PORTABILITY_GUIDE.md`)](./PORTABILITY_GUIDE.md)**: Cách copy thư mục, cài dependencies và cấu hình Tailwind Preset vào dự án mới.
2. ⚡ **[Bắt Đầu Nhanh 5 Phút (`QUICK_START.md`)](./QUICK_START.md)**: Cách tạo trang Dashboard, bảng dữ liệu, form nhập liệu và dialogs.
3. 📖 **[Đặc Tả Chi Tiết 27 UI Components (`UI_COMPONENTS.md`)](./UI_COMPONENTS.md)**: Bảng tra cứu toàn diện props, variants, code mẫu và accessibility cho từng component.
4. 🎨 **[Design Tokens & Theme Guide (`DESIGN_TOKENS.md`)](./DESIGN_TOKENS.md)**: Bảng màu Hex, CSS Variables, Typography, Shadows và Motion.

---

## 📦 Thành Phần Đóng Gói Trong Thư Mục Này

- `components/`: 27 UI components thuần túy (Button, Input, Card, Table, Modal, Stepper, Tabs...).
- `styles/`: CSS bundle (`rogym-theme.css`), tokens, typography, utilities, animations, token values.
- `preset/`: Tailwind Presets hỗ trợ cả ESM (`index.js`) và CommonJS (`index.cjs`).
- `utils/`: Utility `cn()` độc lập.
- `index.ts`: Single Entry Point export toàn bộ UI Kit.
- `package.json`: Danh mục peer dependencies.
