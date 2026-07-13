# EngFlex Backend - API Server

Module **Backend** của dự án EngFlex là một RESTful API server chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ cốt lõi, lưu trữ và truy vấn cơ sở dữ liệu, xác thực người dùng, tích hợp các dịch vụ AI bên thứ ba (Firebase Auth, Azure Cognitive Services) và phục vụ dữ liệu cho hai môi trường Frontend (Next.js) và Mobile (Android Client).

---

## 1. Tech Stack

Dưới đây là các công nghệ và thư viện chính được sử dụng thực tế trong mã nguồn backend:

* **Ngôn ngữ**: Node.js (CommonJS, ES6)
* **Framework**: Express.js (phiên bản `^5.2.1`)
* **Cơ sở dữ liệu**: PostgreSQL
* **Thư viện truy vấn**: `pg` (PostgreSQL client pool, phiên bản `^8.20.0`)
* **Xác thực và phân quyền**: Firebase Admin SDK (phiên bản `^13.9.0`)
* **Đánh giá phát âm AI**: Microsoft Cognitive Services Speech SDK (`^1.50.0`)
* **Quản lý tải file**: Multer (`^2.2.0` - dùng cho việc nhận file ghi âm `.wav`)
* **Tài liệu hóa API**: Swagger UI (`swagger-jsdoc` & `swagger-ui-express`)
* **Chạy môi trường phát triển**: Nodemon (`^3.1.14`)
* **Container hóa**: Docker & Docker Compose
* **Platform triển khai**: Vercel (đã cấu hình qua `vercel.json`)
* **Testing framework**: *Chưa được cấu hình trong project.*

---

## 2. Kiến Trúc Backend

Backend được thiết kế theo kiến trúc phân lớp (Layered Architecture) kết hợp với mô hình MVC đơn giản (chỉ bao gồm Controller và View là JSON API).

```mermaid
graph TD
    Client[Client Request: Web/Mobile] -->|HTTP REST API| Routes[Routes Layer]
    Routes -->|Token Verification| Middleware[Middleware Layer]
    Middleware --> Controllers[Controllers Layer]
    Controllers --> Services[Services Layer]
    Services --> DB[(PostgreSQL Database)]
    Services -->|Speech SDK| AzureSpeech[Azure Cognitive Services Speech]
    Services -->|Admin SDK| FirebaseAdmin[Firebase Admin SDK]
```

### Vai trò các lớp:
1. **Routes (`routes/`)**: Khai báo các endpoint HTTP, ánh xạ url tới các hàm xử lý trong Controller. Được tích hợp JSDoc Swagger để tự động tạo giao diện API Docs.
2. **Middlewares (`middlewares/`)**:
   - `auth.js`: Đánh chặn và giải mã Firebase ID Token (`Bearer <token>`) từ client để xác thực thông tin user.
   - `errorHandler.js`: Bắt và định dạng mọi lỗi phát sinh trong hệ thống trước khi gửi trả về client.
3. **Controllers (`controllers/`)**: Tiếp nhận tham số từ request (query, params, body), kiểm tra tính hợp lệ cơ bản của dữ liệu, gọi tầng Service xử lý nghiệp vụ, và trả về dữ liệu chuẩn thông qua các hàm tiện ích (`utils/response.js`).
4. **Services (`services/`)**: Triển khai logic nghiệp vụ chi tiết, thực hiện các truy vấn cơ sở dữ liệu trực tiếp trên PostgreSQL connection pool.
5. **Database (`db/` & `migrations/`)**: Quản lý kết nối cơ sở dữ liệu và lưu vết cấu trúc schema bằng các file SQL migrations.

---

## 3. Cấu Trúc Thư Mục

Cấu trúc thư mục chính của dự án Backend được thể hiện dưới đây:

```text
Backend/
├── config/             # Cấu hình Swagger API Docs
│   └── swagger.js      # Khai báo metadata và cấu hình quét JSDoc
├── constants/          # Khai báo các hằng số dùng chung trong hệ thống
├── controllers/        # Bộ điều khiển nhận request và gửi response
├── db/                 # Khởi tạo và quản lý PostgreSQL Connection Pool
│   └── index.js        # Cấu hình pool (hỗ trợ SSL cho Neon DB)
├── firebase/           # Khởi tạo Firebase Admin SDK
│   └── index.js        # Đọc credentials từ file hoặc biến môi trường
├── middlewares/        # Middlewares xử lý auth, phân quyền, và bắt lỗi
├── migrations/         # Các file script SQL cấu trúc DB (001_xxx.sql đến 012_xxx.sql)
├── routes/             # Định nghĩa toàn bộ hệ thống API endpoints
├── scripts/            # Các kịch bản tự động hóa chạy migrations
│   └── run-migrations.js # Đọc và thực thi tuần tự các file SQL trong migrations/
├── uploads/            # Thư mục lưu trữ tạm thời các file audio thu âm của người dùng
└── utils/              # Các hàm tiện ích bổ trợ (định dạng response, date, logs)
```

---

## 4. Yêu Cầu Hệ Thống

Để cài đặt và vận hành backend, hệ thống cần đáp ứng các yêu cầu sau:

* **Node.js**: Phiên bản `>= 18.x` (được khuyến nghị)
* **npm**: Trình quản lý thư viện đi kèm Node.js
* **PostgreSQL**: Phiên bản `>= 15`
* **Docker & Docker Compose**: (Tùy chọn) Nếu muốn chạy nhanh mà không cần cài đặt database thủ công.

---

## 5. Cài Đặt

### Cách 1: Triển khai thủ công trên máy local

1. **Di chuyển vào thư mục backend**:
   ```bash
   cd Backend
   ```

2. **Cài đặt các gói thư viện**:
   ```bash
   npm install
   ```

3. **Cấu hình file môi trường**:
   Sao chép hoặc tạo mới file `.env` tại thư mục gốc của backend (Xem chi tiết cấu hình tại mục [Environment Variables](#6-environment-variables)):
   ```bash
   cp .env.example .env
   ```

4. **Khởi tạo dữ liệu cơ sở dữ liệu (Migrations)**:
   Đảm bảo PostgreSQL đang chạy và khớp với cấu hình trong `.env`, sau đó thực thi lệnh:
   ```bash
   npm run migrate
   ```

5. **Khởi động ứng dụng**:
   ```bash
   npm run dev
   ```

---

### Cách 2: Triển khai thông qua Docker Compose

Hệ thống đã tích hợp sẵn tệp cấu hình Docker Compose giúp xây dựng môi trường phát triển nhanh chóng:

1. **Khởi động các dịch vụ (PostgreSQL & Backend Server)**:
   ```bash
   docker compose up --build -d
   ```
   *Lệnh này sẽ tải image PostgreSQL 15, build ứng dụng Node.js từ Dockerfile, khởi tạo backend tại cổng `3000` và database tại cổng `5430` (được map ra ngoài máy chủ).*

2. **Chạy các file SQL Migrations**:
   Sau khi các container ở trạng thái hoạt động tốt (`healthy`), hãy thực thi:
   ```bash
   docker compose exec backend npm run migrate
   ```

---

## 6. Environment Variables

Dưới đây là mô tả chi tiết các biến cấu hình cần thiết trong file `.env`:

| Biến môi trường | Bắt buộc | Mô tả | Ví dụ mẫu |
| :--- | :---: | :--- | :--- |
| `PORT` | Không | Cổng dịch vụ chạy Express (mặc định là `3000`, trong dev thường cấu hình `8000`) | `8000` |
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL đầy đủ (Ưu tiên nếu sử dụng Neon DB) | `postgresql://user:pass@ep-flat-wave.neon.tech/neondb?sslmode=require` |
| `DB_USER` | Có | Username đăng nhập cơ sở dữ liệu PostgreSQL (nếu không có DATABASE_URL) | `postgres` |
| `DB_PASSWORD` | Có | Mật khẩu tài khoản PostgreSQL | `my_secure_password` |
| `DB_HOST` | Có | Địa chỉ máy chủ PostgreSQL | `localhost` hoặc `db` (khi dùng Docker) |
| `DB_PORT` | Có | Cổng kết nối PostgreSQL | `5432` |
| `DB_DATABASE` | Có | Tên cơ sở dữ liệu cần kết nối | `engflix` |
| `FIREBASE_WEB_API_KEY` | Có | API Key dùng để kết nối với API Firebase Auth REST (phục vụ login bằng email/password) | `your_firebase_api_key` |
| `AZURE_SPEECH_KEY` | Có | Key truy cập dịch vụ Azure Cognitive Services Speech | `your_azure_speech_subscription_key` |
| `AZURE_SPEECH_REGION`| Có | Vùng địa lý đăng ký Azure Speech | `southeastasia` |
| `AZURE_VISION_KEY` | Không | Key của dịch vụ Azure Vision (Chưa được cấu hình sử dụng trực tiếp trong API) | `your_azure_vision_key` |
| `AZURE_VISION_ENDPOINT`| Không | Endpoint dịch vụ Azure Vision (Chưa được cấu hình sử dụng trực tiếp trong API) | `https://your-vision-endpoint.cognitiveservices.azure.com/` |
| `DEEPSEEK_API_KEY` | Không | API Key của dịch vụ DeepSeek (Chỉ sử dụng thử nghiệm độc lập ở file `test.js`) | `sk-your-deepseek-api-key` |
| `FIREBASE_SERVICE_ACCOUNT` | Không | Chuỗi JSON chứa toàn bộ key service account của Firebase (Nếu có biến này, hệ thống sẽ ưu tiên dùng để cấu hình Firebase Admin) | `{"type": "service_account", ...}` |

> [!WARNING]
> Không được commit file `.env` chứa thông tin bảo mật hoặc thông tin tài khoản thật lên hệ thống Git. Hãy tạo file `.env.example` để chia sẻ cấu hình mẫu cho dự án.

---

## 7. Cách Chạy Project

* **Môi trường Development (Local)**:
  ```bash
  npm run dev
  ```
  *Ứng dụng sẽ tự động tải lại (hot reload) mỗi khi có sự thay đổi mã nguồn nhờ nodemon.*

* **Khởi chạy Migrations DB**:
  ```bash
  npm run migrate
  ```
  *Đọc tuần tự toàn bộ file SQL trong thư mục `migrations` để cập nhật cấu trúc database.*

---

## 8. Chức Năng Chính

Backend đã cung cấp các tính năng nghiệp vụ cụ thể sau:
1. **Xác thực (Authentication)**: Đăng nhập bằng email/password (qua API Firebase Auth REST) và đồng bộ thông tin tài khoản của người dùng từ Firebase về cơ sở dữ liệu cục bộ PostgreSQL (`/api/v1/auth/sync`).
2. **Quản lý Bài học & Danh mục**: Cung cấp danh sách các danh mục cấp độ bài học, tìm kiếm, phân trang và truy xuất chi tiết bài học kèm theo danh sách các câu transcripts (`/api/v1/lessons`, `/api/v1/categories`).
3. **Tiến độ học tập**: Theo dõi việc đọc transcripts của người dùng, ghi nhận lịch sử hoàn thành hoặc học dở của bài học, lưu trạng thái nghe chép chính tả (Dictation) và nhại giọng (Shadowing) cho từng câu.
4. **Từ vựng cá nhân hóa**: Cho phép người dùng học các bộ từ vựng mặc định của hệ thống, tạo các bộ từ vựng cá nhân, thêm/sửa/xóa từ vựng trong bộ của mình (`/api/v1/vocabulary-decks`).
5. **Đánh giá phát âm AI**: Tiếp nhận tệp âm thanh `.wav` thu âm giọng đọc của người dùng gửi lên từ Client, sử dụng Azure Cognitive Services Speech SDK để đánh giá phát âm chi tiết (tính điểm Overall, Accuracy, Fluency, Completeness, Prosody) và đưa ra phản hồi sửa lỗi.
6. **Mạng xã hội & Cộng đồng**: Đăng bài viết cộng đồng (tạo feed, xem trang cá nhân, xóa bài), tương tác thích (like) bài viết, và viết bình luận (comments).
7. **Hệ thống bạn bè**: Gửi yêu cầu kết bạn, chấp nhận kết bạn, tìm kiếm người dùng mới, và lấy danh sách bạn bè hiện tại.
8. **Chat trực tuyến**: Gửi và nhận tin nhắn trong phòng chat cộng đồng của hệ thống.
9. **Dashboard quản trị**: Các API CRUD quản lý Bài học, Categories, Transcripts, và Từ vựng dành riêng cho vai trò Admin (`/api/v1/admin/*`).

---

## 9. API Documentation

Tài liệu API được xây dựng tự động bằng Swagger UI. Khi server đang chạy, nhà phát triển có thể truy cập trực tiếp bằng trình duyệt tại địa chỉ:
* **Swagger UI URL**: `http://localhost:8000/api-docs`

### Danh sách nhóm API chính (RESTful):

| Method | Endpoint | Xác thực (Bearer Token) | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập bằng email/password (trả về Firebase ID Token) |
| `POST` | `/api/v1/auth/sync` | **Có** | Đồng bộ dữ liệu tài khoản từ Firebase vào PostgreSQL |
| `GET` | `/api/v1/auth/profile` | **Có** | Lấy thông tin cá nhân của người dùng hiện tại |
| `PUT` | `/api/v1/auth/profile` | **Có** | Cập nhật tên và số điện thoại cá nhân |
| `PUT` | `/api/v1/auth/avatar` | **Có** | Cập nhật đường dẫn ảnh đại diện mới |
| `GET` | `/api/v1/categories` | Không | Lấy danh sách các danh mục bài học |
| `GET` | `/api/v1/lessons` | Không | Lấy danh sách bài học (hỗ trợ phân trang, tìm kiếm) |
| `GET` | `/api/v1/lessons/:lessonId/transcripts`| Không | Lấy danh sách câu transcript của một bài học |
| `GET` | `/api/v1/bookmarks` | **Có** | Lấy danh sách bài học/câu đã lưu đánh dấu |
| `POST` | `/api/v1/bookmarks/:lessonId` | **Có** | Lưu đánh dấu bài học |
| `POST` | `/api/v1/transcript-bookmarks` | **Có** | Thêm đánh dấu và ghi chú cho câu transcript |
| `GET` | `/api/v1/learning-history` | **Có** | Lấy lịch sử học tập cá nhân |
| `POST` | `/api/v1/learning-history` | **Có** | Lưu lịch sử học bài học (hoàn thành Dictation/Pronunciation) |
| `POST` | `/api/v1/pronunciation-attempts`| **Có** | Tải lên file WAV và nhận đánh giá phát âm AI (Azure Speech SDK) |
| `GET` | `/api/v1/pronunciation/progress/:lessonId`| **Có** | Lấy điểm phát âm tốt nhất theo bài học |
| `GET` | `/api/v1/posts/feed` | **Có** | Lấy bảng tin cộng đồng |
| `POST` | `/api/v1/posts` | **Có** | Tạo bài viết mới |
| `POST` | `/api/v1/posts/:id/comments` | **Có** | Thêm bình luận vào bài viết |
| `GET` | `/api/v1/friendships` | **Có** | Danh sách bạn bè hiện tại |
| `POST` | `/api/v1/friendships/requests` | **Có** | Gửi yêu cầu kết bạn mới |
| `GET` | `/api/v1/chat` | **Có** | Lấy danh sách tin nhắn phòng chat cộng đồng |
| `POST` | `/api/v1/chat` | **Có** | Gửi tin nhắn chat mới |

---

## 10. Database Schema

Cơ sở dữ liệu của dự án sử dụng hệ quản trị cơ sở dữ liệu **PostgreSQL** bao gồm các bảng chính sau:

1. **`users`**: Lưu trữ thông tin tài khoản người dùng (`uid` khóa chính lấy từ Firebase UID, email, tên, vai trò `user_role`, `avatar_url`, `phone`, `created_at`).
2. **`categories`**: Danh mục bài học (ví dụ: Beginner, Business, Daily life).
3. **`lessons`**: Lưu chi tiết thông tin bài học (title, video_url nhúng từ Youtube, level, duration).
4. **`transcripts`**: Lưu nội dung từng câu của bài học (lesson_id, sequence, content, phonetic, dịch nghĩa vietnamese, mốc thời gian start_timestamp và end_timestamp phục vụ cắt video phát lặp).
5. **`bookmarks`** & **`transcript_bookmarks`**: Lưu trữ ghi chú các bài học hoặc các câu transcript mà người dùng đánh dấu học lại.
6. **`transcript_progress`**: Theo dõi tiến độ học đọc transcript của người dùng.
7. **`learning_history`**: Lưu lịch sử hoàn thành tổng quan bài học.
8. **`dictation_status`** & **`shadowing_status`**: Ghi nhận xem người dùng đã hoàn thành các câu ở các chế độ Dictation hay Shadowing tương ứng chưa.
9. **`vocabulary_categories`**, **`vocabulary_decks`**, & **`vocabulary_items`**: Hệ thống danh mục, bộ từ vựng cá nhân tự tạo và các từ vựng chi tiết được lưu trữ.
10. **`pronunciation_attempts`** & **`pronunciation_progress`**: Lưu trữ lịch sử tất cả các lần ghi âm thử thách phát âm của người dùng cùng điểm số phân tích và cập nhật điểm số tốt nhất cho mỗi câu.
11. **`friendships`**: Quản lý mối quan hệ bạn bè giữa các người dùng (`sender_id`, `receiver_id`, `status` - pending/accepted).
12. **`posts`**, **`likes`**, & **`comments`**: Các bảng cho hệ thống mạng xã hội nội bộ.
13. **`messages`**: Quản lý các tin nhắn chat cộng đồng giữa các người dùng.

*Lưu ý: Mối quan hệ được duy trì thông qua các khóa ngoại (Foreign Keys) chặt chẽ giữa các bảng như được biểu diễn trong sơ đồ ERD ở tài liệu tổng.*

---

## 11. Kết Nối Giữa Các Module

* **API Endpoints**: Backend cung cấp cổng kết nối RESTful API tại `http://localhost:8000/api/v1/` mặc định trong môi trường phát triển local.
* **Authentication**: Các Client (Web & Mobile) phải đăng nhập trực tiếp với Firebase Auth để lấy ID Token dạng JWT. Token này phải được đính kèm vào header của mọi request API yêu cầu đăng nhập:
  ```http
  Authorization: Bearer <FIREBASE_ID_TOKEN>
  ```
* **CORS**: Đã được cấu hình thông qua gói `cors` nhằm cho phép tất cả các nguồn gốc kết nối (Web Client) gửi yêu cầu và nhận dữ liệu trong quá trình phát triển.

---

## 12. Testing

> [!NOTE]
> Dự án Backend **hiện chưa có bộ kiểm thử tự động (Unit Test / Integration Test)** tích hợp trong mã nguồn chính.
> 
> Chỉ có một tệp kịch bản kiểm tra kết nối API DeepSeek thủ công tại: [test.js](file:///d:/EngFlex/Backend/test.js).
> Để chạy file này:
> ```bash
> node test.js
> ```

---

## 13. Code Quality

* **Công cụ**: *Chưa được cấu hình linting (ESLint, Prettier) hay các công cụ phân tích tĩnh trong phần backend.*
* **Quy ước viết code**: Sử dụng chuẩn Node.js CommonJS module (`require`, `module.exports`) và xử lý lỗi tập trung bằng Middleware.

---

## 14. Build và Deployment

### Tạo Production Build trên Vercel
Backend được thiết kế tương thích để chạy dưới dạng các Serverless Functions trên nền tảng **Vercel** thông qua file [vercel.json](file:///d:/EngFlex/Backend/vercel.json).
* Khi đẩy mã nguồn lên GitHub và kết nối với dự án Vercel, hệ thống CI/CD của Vercel sẽ tự động build ứng dụng thành Serverless API.
* Hãy cấu hình toàn bộ các biến môi trường tại trang cấu hình Settings của Vercel giống như trong file `.env`.

### Docker Production Image
Nếu triển khai lên các máy chủ ảo hoặc các dịch vụ đám mây (AWS, Google Cloud, DigitalOcean):
1. Đảm bảo cấu hình môi trường sản xuất (sử dụng cổng `3000` hoặc cổng được cấp phát).
2. Chạy lệnh build image từ Dockerfile:
   ```bash
   docker build -t engflix-backend:latest .
   ```

---

## 15. Troubleshooting

1. **Lỗi `Error loading Firebase credentials`**:
   - *Nguyên nhân*: Chưa cấu hình file `serviceAccountKey.json` ở thư mục gốc của Backend hoặc thiếu biến môi trường `FIREBASE_PRIVATE_KEY`.
   - *Khắc phục*: Tải file JSON cấu hình Service Account từ bảng điều khiển Firebase Console -> Project Settings -> Service accounts, lưu dưới tên `serviceAccountKey.json` trong thư mục `Backend/`.
2. **Lỗi `connect ECONNREFUSED 127.0.0.1:5432`**:
   - *Nguyên nhân*: Máy chủ PostgreSQL chưa khởi động hoặc sai thông tin kết nối cổng / user trong file `.env`.
   - *Khắc phục*: Kiểm tra dịch vụ Postgres trên máy local hoặc thay đổi port thành `5430` nếu đang kết nối từ máy local vào PostgreSQL chạy trong container Docker.
3. **Lỗi Azure Speech trả về trạng thái lỗi hoặc điểm số rỗng**:
   - *Nguyên nhân*: Key Azure Speech hoặc vùng (region) cấu hình bị sai hoặc hết hạn hạn mức.
   - *Khắc phục*: Kiểm tra cấu hình `AZURE_SPEECH_KEY` và `AZURE_SPEECH_REGION` trong file `.env` xem có khớp với trang quản trị Microsoft Azure Portal hay không.
4. **Lỗi CORS khi gọi API từ Frontend**:
   - *Nguyên nhân*: Đôi khi cấu hình allowed origins không bao gồm port chạy của Web Client.
   - *Khắc phục*: Xem lại file `index.js` tại dòng khai báo `app.use(cors())`. Trong phát triển, cấu hình này đang cho phép nhận request từ tất cả các origin.

---

## 16. Security Notes

* **Bảo mật Credentials**: Tuyệt đối không commit file `.env`, file `serviceAccountKey.json` hoặc các tệp cấu hình chứa key thật lên GitHub. Các file này đã được khai báo loại trừ trong `.gitignore`.
* **Database Access**: Khi chạy production, luôn tắt chế độ `rejectUnauthorized: false` hoặc sử dụng SSL đầy đủ để đảm bảo dữ liệu truyền nhận giữa backend và database không bị nghe lén.
* **Firebase Token**: Firebase ID Token có thời gian sống ngắn (1 giờ). Client cần tự động làm mới token và gửi token mới lên backend để tránh nhận lỗi `401 Unauthorized`.

---

## 17. Contributing

Quy trình đóng góp phát triển mã nguồn backend:
1. Tạo một nhánh mới từ nhánh chính (`git checkout -b feature/amazing-feature`).
2. Thực hiện cập nhật mã nguồn (tuân thủ cấu trúc phân lớp).
3. Đảm bảo viết đầy đủ tài liệu API bằng comment JSDoc `@swagger` trên các route mới.
4. Tạo Pull Request (PR) mô tả rõ ràng các thay đổi và tự kiểm tra tính tương thích với database schema.

---

## 18. License

> Project hiện chưa khai báo license.
