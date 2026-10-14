# EduSync WebApp 🎓

Dự án ứng dụng web quản lý học tập **EduSync**, được xây dựng trên nền tảng **React 19**, **TypeScript**, **Vite** và **Tailwind CSS**.

---

## 🚀 Công Nghệ Sử Dụng

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/) (khởi động nhanh & Hot Module Replacement cực mượt)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Google Fonts ([Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans))

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt thư viện dependencies:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development Server):
```bash
npm run dev
```
> Ứng dụng sẽ mở tại `http://localhost:5173/`.

### 3. Build sản phẩm (Production Bundle):
```bash
npm run build
```

### 4. Xem trước bản build:
```bash
npm run preview
```

---

## 📁 Cấu Trúc Thư Mục

```
EduSync-WebApp/
├── public/              # Static assets
├── src/
│   ├── assets/          # Hình ảnh, icons local
│   ├── App.tsx          # Giao diện chính EduSync (Dashboard, Khóa học, Hạn chót, Điểm danh)
│   ├── App.css          # Style bổ trợ ứng dụng
│   ├── index.css        # Cấu hình Tailwind CSS & Typography
│   └── main.tsx         # Entry point React
├── index.html           # HTML template với SEO meta & Google Fonts
├── vite.config.ts       # Cấu hình Vite & Tailwind CSS plugin
├── tsconfig.json        # Cấu hình TypeScript
└── package.json         # Danh sách dependencies & scripts
```
