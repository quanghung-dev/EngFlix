# EngFlex - Hệ Thống Học Tiếng Anh Qua Phim & Video

Dự án **EngFlex** (trước đây có tên là **EngFlix**) là một hệ thống hỗ trợ học tiếng Anh giao tiếp thông qua phim và video, kết hợp các phương pháp học như Dictation (Chính tả), Shadowing (Nhại giọng), và Đánh giá phát âm (Pronunciation Assessment) sử dụng trí tuệ nhân tạo.

Dự án bao gồm hai thành phần chính:
1. **Backend**: API server viết bằng Node.js (Express), sử dụng PostgreSQL làm cơ sở dữ liệu chính và tích hợp dịch vụ Firebase Authentication, Azure Cognitive Speech Services.
2. **Mobile**: Ứng dụng Android native viết hoàn toàn bằng **Java**, sử dụng kiến trúc Fragment-Repository với kết nối API qua Retrofit.

---

## 1. Kiến Trúc Tổng Quan Hệ Thống

Hệ thống hoạt động theo mô hình Client-Server. Ứng dụng di động (Client) tương tác trực tiếp với Backend API Server để thực hiện các nghiệp vụ học tập, quản lý từ vựng, lưu trữ tiến độ và gửi tệp ghi âm giọng nói để phân tích phát âm.

```mermaid
graph TD
    subgraph Client (Mobile App)
        Android[Android App - Java]
        YTPlayer[YouTube Player - WebView]
        AudioRec[Audio Recorder - AudioRecord]
    end

    subgraph Authentication & External Services
        Firebase[Firebase Auth]
        AzureSpeech[Azure Speech Services]
    end

    subgraph Backend Services
        API[Express API Server]
        PostgreSQL[(PostgreSQL Database)]
    end

    %% Interactions
    Android -->|1. Authenticate| Firebase
    Android -->|2. API Requests| API
    API -->|3. Query Data| PostgreSQL
    API -->|4. Speech Assessment| AzureSpeech
    API -->|5. Token Verification| Firebase
```

---

## 2. Công Nghệ Sử Dụng

### Backend
- **Framework**: Node.js, Express.js
- **Database**: PostgreSQL (sử dụng thư viện `pg` làm client kết nối)
- **Authentication**: Firebase Admin SDK (xác thực token) & Firebase Auth REST API (để giả lập đăng nhập)
- **AI Integrations**: Azure Cognitive Services Speech SDK (đánh giá phát âm chi tiết ở cấp độ âm vị - Phoneme)
- **Deployment**: Docker & Docker Compose

### Mobile (Android)
- **Ngôn ngữ**: Java 11 (Không sử dụng Kotlin)
- **UI & Layout**: XML, Material Components, ViewPager2, FlexboxLayout
- **Networking**: Retrofit 2, OkHttp 4, Gson
- **Media**: YouTube Player (nhúng qua WebView iframe kết hợp Javascript Bridge)
- **Audio**: API Android `AudioRecord` (thu âm định dạng PCM raw và tự đóng gói header WAV)
- **Navigation**: Jetpack Navigation Component
- **Authentication**: Firebase Auth SDK (Android)

---

## 3. Cấu Trúc Thư Mục Dự Án

```
EngFlex/
├── Backend/               # Mã nguồn API Server (Node.js)
│   ├── config/            # Cấu hình Swagger API Docs
│   ├── constants/         # Các hằng số (Ví dụ: Vai trò người dùng)
│   ├── controllers/       # Lớp điều hướng và xử lý request
│   ├── db/                # Kết nối DB và các file SQL Migrations
│   ├── firebase/          # Cấu hình Firebase Admin SDK
│   ├── middlewares/       # Middleware xác thực và xử lý lỗi
│   ├── routes/            # Định tuyến API
│   ├── services/          # Xử lý logic nghiệp vụ và truy vấn DB
│   ├── utils/             # Các helper dùng chung (phân trang, định dạng phản hồi)
│   ├── Dockerfile         # Docker build file cho backend
│   └── docker-compose.yml # File cấu hình môi trường Docker chạy cùng DB
└── mobile/                # Mã nguồn ứng dụng di động Android
    ├── app/               # Module chính chạy ứng dụng (:app)
    │   └── src/main/
    │       ├── AndroidManifest.xml
    │       ├── java/com/example/app/  # Toàn bộ mã nguồn Java của app
    │       └── res/                   # Layouts, drawable, navigation graph
    ├── core/              # Thư mục chứa các file stub (chưa cấu hình thành Gradle module)
    └── feature/           # Thư mục chứa các file stub (chưa cấu hình thành Gradle module)
```

> [!WARNING]
> Hai thư mục `mobile/core` và `mobile/feature` hiện tại chỉ chứa các lớp rỗng (stub classes) và **không** được đăng ký trong `settings.gradle.kts`. Toàn bộ mã nguồn ứng dụng thực tế nằm trong module duy nhất là `mobile/app`.

---

## 4. Tài Liệu Chi Tiết Các Thành Phần

Để xem hướng dẫn cài đặt, chạy thử và phân tích sâu hơn từng phần, vui lòng truy cập:
- Hướng dẫn và Tài liệu Backend: [Backend README](file:///D:/EngFlex/Backend/README.md)
- Hướng dẫn và Tài liệu Mobile: [Mobile README](file:///D:/EngFlex/mobile/README.md)
