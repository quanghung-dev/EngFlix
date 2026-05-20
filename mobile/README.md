# 📘 EngFlix - English Learning Platform via YouTube

![EngFlix Banner](https://img.shields.io/badge/Android-Java-brightgreen?style=for-the-badge&logo=android)
![Architecture](https://img.shields.io/badge/Architecture-Repository_Pattern-blue?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Firestore-orange?style=for-the-badge&logo=firebase)
![Retrofit](https://img.shields.io/badge/Network-Retrofit_2-red?style=for-the-badge)

**EngFlix** là một ứng dụng di động học tiếng Anh hiện đại, kết hợp sức mạnh của kho nội dung YouTube khổng lồ với phương pháp học "Dictation" (Nghe chép chính tả). Ứng dụng giúp người dùng nâng cao kỹ năng nghe và vốn từ vựng thông qua các bài học trực quan và tương tác cao.

---

## 📑 Mục lục
1.  [Giới thiệu](#-giới-thiệu)
2.  [Chức năng chính](#-chức-năng-chính)
3.  [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
4.  [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
5.  [Kiến trúc ứng dụng](#-kiến-trúc-ứng-dụng)
6.  [Luồng dữ liệu (Data Flow)](#-luồng-dữ-liệu-data-flow)
7.  [Cài đặt & Chạy ứng dụng](#-cài-đặt--chạy-ứng-dụng)
8.  [Cấu hình API & Firebase](#-cấu-hình-api--firebase)
9.  [Xác thực (Authentication)](#-xác-thực-authentication)
10. [Quy tắc Code & Convention](#-quy-tắc-code--convention)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)
12. [Lộ trình phát triển](#-lộ-trình-phát-triển)

---

## 🚀 Giới thiệu
Dự án được xây dựng trên nền tảng Android (Java), tập trung vào trải nghiệm người dùng mượt mà với UI/UX hiện đại. Điểm nhấn của EngFlix là khả năng nhúng trình phát YouTube và điều khiển trực tiếp thông qua mã nguồn Java để phục vụ mục đích học tập.

## ✨ Chức năng chính
- 🔐 **Hệ thống xác thực:** Đăng ký, đăng nhập qua Email và tích hợp Google/Facebook (via Firebase).
- 📺 **Học qua Video:** Xem các bài học từ YouTube với giao diện tối ưu.
- ✍️ **Nghe chép chính tả (Dictation):** 
    - Hiển thị từng câu (Transcript).
    - Hệ thống "Word Cards" ẩn/hiện từ để thử thách người dùng.
    - Điều khiển tốc độ video (0.25x - 2.0x).
    - Tua lại câu đang học (Auto-replay).
- 🗂 **Phân loại bài học:** Danh mục bài học đa dạng (Movies, Music, Daily life...).
- 📊 **Theo dõi tiến độ:** Tính toán % hoàn thành bài học theo thời gian thực.
- 📚 **Kho từ vựng:** Lưu trữ và ôn tập từ vựng cá nhân.

## 🛠 Công nghệ sử dụng
| Category | Library/Tech | Purpose |
| :--- | :--- | :--- |
| **UI** | Material Components, FlexboxLayout | Xây dựng giao diện hiện đại, responsive word cards |
| **Networking** | Retrofit 2, OkHttp 3, Gson | Giao tiếp API RESTful |
| **Media** | WebView (YouTube Bridge) | Nhúng và điều khiển YouTube Player qua JavaScript |
| **Database** | Firebase Firestore, SharedPreferences | Lưu trữ dữ liệu đám mây và cấu hình cục bộ |
| **Auth** | Firebase Authentication | Quản lý người dùng bảo mật |
| **Images** | Glide | Load ảnh từ URL mượt mà |
| **Navigation** | Jetpack Navigation Component | Quản lý luồng chuyển màn hình tập trung |

## 📁 Cấu trúc thư mục
Ứng dụng tuân thủ cấu trúc **Package by Feature**, giúp dễ dàng mở rộng và bảo trì:

```text
com.example.app
├── adapter          # Các Adapter dùng chung (ví dụ: Adapter cho bài học)
├── core             # Chứa Base class, Custom UI Components
│   ├── ui           # Custom Bottom Navigation, BaseActivity
│   └── utils        # Helper classes (BaseUtils)
├── data             # Lớp dữ liệu
│   ├── local        # SharedPreferences, TokenManager
│   ├── remote       # Retrofit API Interfaces, Model Responses
│   └── repository   # Lớp trung gian xử lý Logic lấy dữ liệu
├── diaglog          # Các Dialog/BottomSheet tùy chỉnh (SpoilerWarning, ChooseMode)
├── feature          # Chứa các Module chức năng chính
│   ├── auth         # Login, Signup Fragments
│   ├── study        # StudyFragment, LessonsListFragment
│   ├── dictation    # Logic Nghe chép chính tả (DictationFragment)
│   └── vocabulary   # Quản lý từ vựng
└── MainActivity.java # Activity chính chứa NavHostFragment
```

## 🏗 Kiến trúc ứng dụng
Dự án áp dụng mô hình **Repository Pattern**. Đây là lựa chọn tối ưu để tách biệt logic nghiệp vụ khỏi lớp giao diện.

- **View (Fragment/Activity):** Chỉ đảm nhận nhiệm vụ hiển thị UI và lắng nghe sự kiện từ người dùng.
- **Repository:** Đóng vai trò là "Single Source of Truth". Nó quyết định lấy dữ liệu từ Cache (Local) hay từ Server (Remote).
- **Network Model (DTO):** Định nghĩa cấu trúc dữ liệu trả về từ API.

## 🔄 Luồng dữ liệu (Data Flow)
1. **User Interaction:** Người dùng chọn một bài học.
2. **Repository Call:** Fragment gọi hàm từ `LessonsRepository`.
3. **Remote Fetch:** Repository sử dụng `Retrofit` gửi request lên Backend.
4. **Callback:** Dữ liệu trả về (Response) được `Gson` parse thành Object.
5. **UI Update:** Fragment nhận kết quả qua Callback và gọi `Adapter.notifyDataSetChanged()` để cập nhật danh sách bài học.

## ⚙️ Cài đặt & Chạy ứng dụng

### Yêu cầu môi trường
- **Android Studio:** Ladybug (hoặc mới hơn).
- **JDK:** Version 11.
- **Android SDK:** Compile SDK 36, Min SDK 24.
- **Gradle:** Phiên bản 8.0+.

### Các bước thực hiện
1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/engflix-mobile.git
   ```
2. **Cấu hình `local.properties`:**
   Tạo file `local.properties` tại thư mục gốc và thêm các thông tin sau:
   ```properties
   BASE_URL=https://api.yourdomain.com/
   FIREBASE_API_KEY=your_firebase_key
   ```
3. **Firebase Setup:**
   - Thêm file `google-services.json` vào thư mục `app/`.
4. **Build & Run:**
   Nhấn `Shift + F10` hoặc nút **Run** trong Android Studio.

## 🔗 Cấu hình API
Mẫu Request lấy danh sách Transcript:
- **Endpoint:** `GET /api/transcripts/{lessonId}`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      { "id": 1, "content": "Hello world", "start_time": 10.5 },
      { "id": 2, "content": "Welcome to EngFlix", "start_time": 15.2 }
    ]
  }
  ```

## 🎨 Screenshot UI
| Study Screen | Dictation Mode | Choose Mode |
| :---: | :---: | :---: |
| ![Study](https://via.placeholder.com/200x400?text=Study+Screen) | ![Dictation](https://via.placeholder.com/200x400?text=Dictation+UI) | ![Mode](https://via.placeholder.com/200x400?text=Bottom+Sheet) |

## 📦 Build Release
Để tạo file APK release, chạy lệnh sau trong terminal:
```bash
./gradlew assembleRelease
```
File APK sẽ nằm tại: `app/build/outputs/apk/release/`

## ⚖️ Quy tắc Code (Convention)
- **Naming:** 
    - Layout: `fragment_feature_name.xml`, `item_list_name.xml`.
    - Id: `btn_submit`, `tv_title` (Sử dụng snake_case cho resource).
- **Logic:** Luôn xử lý lỗi API trong `onError` của Callback để tránh crash app.
- **UI:** Sử dụng `ViewBinding` để tránh `findViewById` rườm rà.

## 🛠 Troubleshooting
- **Lỗi 401 Unauthorized:** Kiểm tra lại `TokenManager`, có thể Token đã hết hạn.
- **YouTube không load:** Kiểm tra kết nối internet hoặc API Key của YouTube nhúng.
- **WebView trắng xóa:** Đảm bảo `JavaScriptEnabled` đã được set là `true`.

## ❓ FAQ
**Q: App có hỗ trợ học offline không?**
A: Hiện tại app yêu cầu kết nối internet để stream video từ YouTube và gọi API.

**Q: Làm sao để thay đổi tốc độ mặc định?**
A: Bạn có thể chỉnh sửa mảng `SPEED_LEVELS` trong `DictationFragment.java`.

---

## 📜 License
Dự án được phát hành dưới bản quyền **MIT License**. Vui lòng ghi rõ nguồn nếu bạn sử dụng mã nguồn này.

---
*Cảm ơn bạn đã quan tâm đến EngFlix! Nếu thấy hữu ích, hãy tặng chúng tôi một ⭐ nhé!*
