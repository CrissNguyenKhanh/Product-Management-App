# BÁO CÁO GIỮA KỲ

## USER MANAGEMENT APP — ỨNG DỤNG QUẢN LÝ NGƯỜI DÙNG DÀNH CHO ADMIN

> Môn học: Lập trình đa nền tảng  
> Repository: https://github.com/CrissNguyenKhanh/Product-Management-App  
> Video demo: `[CHƯA CUNG CẤP — bổ sung sau khi quay]`  
> Ảnh minh họa thực tế: `[CHƯA CHỤP — thực hiện theo docs/HUONG_DAN_CHUP_ANH_IPHONE.md]`

## 1. Giới thiệu đề tài

User Management App là ứng dụng React Native chạy trên iPhone bằng Expo Go. Ứng dụng cung cấp không gian quản trị tập trung để Admin quản lý tài khoản người dùng trong Firebase. Source được chuyển đổi từ bài toán quản lý sản phẩm sang quản lý người dùng, loại bỏ toàn bộ model, route và service sản phẩm cũ.

## 2. Mục tiêu của ứng dụng

- Đáp ứng CRUD người dùng theo đề thi.
- Chỉ dùng bốn trường `username`, `email`, `password`, `image`.
- Cho phép chọn và hiển thị ảnh đại diện từ iPhone.
- Bảo vệ mật khẩu bằng Firebase Authentication.
- Phân quyền Admin bằng Firebase custom claims.
- Có UI sáng, hiện đại, responsive và an toàn với Safe Area.

## 3. Công nghệ sử dụng

| Nhóm | Công nghệ |
|---|---|
| Mobile | React Native 0.88, React 19, Expo SDK 58 |
| Ngôn ngữ | TypeScript 6 |
| Điều hướng | Expo Router |
| Xác thực | Firebase Authentication |
| Dữ liệu | Cloud Firestore |
| Ảnh | Expo Image Picker, Image Manipulator, Firebase Storage |
| Backend | Callable Cloud Functions v2, Firebase Admin SDK |
| Phân quyền | Custom claim `admin`, Firestore Rules, Storage Rules |

## 4. Kiến trúc hệ thống

```text
iPhone / Expo Go
      │
      ├── Firebase Authentication ── đăng nhập Admin, duy trì phiên
      │
      ├── Cloud Firestore ────────── đọc users theo Security Rules
      │
      ├── Cloud Storage ──────────── ảnh avatars/{uid}/profile.jpg
      │
      └── Callable Cloud Functions ─ kiểm tra admin=true
              └── Firebase Admin SDK
                    ├── tạo/cập nhật/xóa Auth user
                    ├── ghi đúng 4 trường Firestore
                    └── xóa ảnh liên quan
```

Ứng dụng client không có Admin SDK và không chứa service-account key. Những thao tác đặc quyền chạy trong môi trường Cloud Functions.

## 5. Cấu trúc source code

```text
app/
  _layout.tsx           AuthProvider, SafeAreaProvider, Router
  login.tsx             đăng nhập Admin
  dashboard.tsx         dashboard
  users.tsx             danh sách và tìm kiếm
  user-form.tsx         thêm/sửa/đổi password/chọn ảnh
  user-detail.tsx       chi tiết và xóa
components/             guard, header, avatar dùng lại
src/
  config/firebase.ts    một Firebase app duy nhất
  contexts/             trạng thái xác thực và claim Admin
  services/             callable, Firestore, Storage
  types/                model bốn trường
  utils/                chuẩn hóa lỗi Firebase
functions/
  src/index.ts           ba Callable Functions
  src/scripts/set-admin.ts
firestore.rules
storage.rules
```

## 6. Cách tạo và cấu hình Firebase

1. Dùng project `product-management-app-239fa`.
2. Bật Email/Password trong Authentication.
3. Tạo Firestore và Storage.
4. Copy `.env.example` thành `.env`, sau đó điền Firebase Web App config.
5. Chạy `npm --prefix functions install` và build Functions.
6. Deploy Functions, Firestore Rules và Storage Rules.
7. Tạo tài khoản Admin đầu tiên trong Firebase Console.
8. Chạy script `set-admin` bằng Application Default Credentials.

Chi tiết và lệnh chính xác nằm trong README. Cloud Functions/Storage có thể yêu cầu Blaze plan.

## 7. Cấu trúc dữ liệu gồm bốn trường

Collection: `users`. Document ID: Firebase Auth UID.

```json
{
  "username": "nguyenvana",
  "email": "user@gmail.com",
  "password": "[managed-by-firebase-auth]",
  "image": "https://... hoặc chuỗi rỗng"
}
```

Không lưu `id`, `role`, `createdAt`, `updatedAt`, `phone`, `status` hoặc trường sản phẩm. Callable Function dùng `set()` với object đúng bốn khóa để không giữ trường thừa.

## 8. Quản lý password an toàn

Form vẫn có trường password đúng đề bài. Password được gửi qua kết nối Firebase tới Admin SDK để tạo/đổi credential trong Firebase Authentication. Firestore chỉ lưu sentinel `[managed-by-firebase-auth]`; UI chỉ hiển thị `********`. Admin không đọc lại mật khẩu cũ, hash hay credential của người dùng.

## 9. Chức năng đăng nhập Admin

Màn hình có email, password, nút hiện/ẩn, loading và thông báo lỗi. Sau `signInWithEmailAndPassword`, app ép refresh ID token và kiểm tra `claims.admin === true`. Tài khoản không có claim bị đăng xuất và không được mở route quản trị. Phiên được duy trì bằng AsyncStorage.

## 10. Thêm người dùng

Admin nhập username, email, password và chọn ảnh tùy chọn. Callable `createManagedUser` tạo Firebase Auth user mà không thay đổi phiên Admin, sau đó ghi document Firestore. Email trùng, mật khẩu yếu và dữ liệu thiếu được kiểm tra ở cả client và server. Nút submit bị khóa khi đang xử lý.

## 11. Hiển thị danh sách

Danh sách dùng listener Firestore realtime, có avatar, username, email và password che. Có tìm kiếm không phân biệt hoa thường, pull-to-refresh, loading, error, empty state và nút xem/sửa/xóa.

## 12. Sửa người dùng

Callable `updateManagedUser` đồng bộ username/email với Authentication và Firestore. Password mới là tùy chọn, không cần biết password cũ. Admin có thể thay hoặc xóa ảnh. Document luôn được ghi lại đúng bốn trường.

## 13. Xóa người dùng

App hiển thị Alert xác nhận với Hủy/Xóa. Callable xóa thư mục ảnh, document Firestore và Auth user. Backend chặn Admin tự xóa tài khoản đang đăng nhập.

## 14. Chọn và hiển thị ảnh

Expo Image Picker xin quyền thư viện. Ảnh được crop vuông, resize 640×640 và nén JPEG trước khi upload. URL tải được ghi vào trường `image`. Khi trống, UI dùng avatar chữ cái/biểu tượng. Lỗi quyền, mạng và upload đều có thông báo.

## 15. Chức năng nâng cao

- Tìm kiếm realtime theo username/email.
- Pull-to-refresh.
- Custom claim Admin và route guard.
- Duy trì phiên đăng nhập.
- Nén ảnh trước upload.
- Chuẩn hóa thông báo lỗi Firebase.
- Xóa đồng bộ Auth/Firestore/Storage.

## 16. Lệnh cài đặt và chạy

```powershell
npm install
npm --prefix functions install
npm run typecheck
npm run lint
npm run functions:build
npx expo install --check
npx expo start --clear
```

## 17. Kết quả kiểm thử thực tế

Kết quả kiểm tra tĩnh tại máy phát triển ngày 11/11/2026:

| Kiểm tra | Kết quả |
|---|---|
| `npm run typecheck` | Đạt, không có lỗi TypeScript |
| `npm run lint` | Đạt, không có lỗi/cảnh báo |
| `npm run functions:build` | Đạt |
| `npm install` | Đạt, lockfile đồng bộ |
| `npx expo install --check` | Đạt, dependencies đúng SDK 58 |
| `npx expo-doctor` | Đạt 20/20 kiểm tra |
| `npx expo start --clear` | Metro khởi động, tạo QR Expo Go thành công |
| iOS export bundle | Đạt, bundle 1.279 modules thành công |
| `npm --prefix functions audit --omit=dev` | Đạt, 0 lỗ hổng được báo cáo |
| `npm audit --omit=dev` | Còn 7 cảnh báo transitive: 3 moderate, 4 high; không có critical |
| Firebase deploy thật | `[CHƯA THỰC HIỆN — cần quyền project/billing]` |
| CRUD trên iPhone thật | `[CHƯA THỰC HIỆN — cần deploy backend và thiết bị]` |
| Upload ảnh thật | `[CHƯA THỰC HIỆN — cần Storage đã bật/deploy rules]` |

Không suy diễn các kịch bản thiết bị/Firebase là thành công khi chưa chạy thực tế.

Audit của app client hiện báo cảnh báo trong cây Expo Fingerprint và gRPC do Firebase Firestore kéo theo. `npm audit` chỉ đề xuất hạ xuống Expo 52/Firebase 9, trái yêu cầu SDK 58 và có nguy cơ phá tương thích, nên không dùng `--force` hoặc downgrade. Cần theo dõi bản vá upstream; gRPC là nhánh transport Node trong package Firestore và không phải đường chạy React Native chính, nhưng cảnh báo vẫn được ghi nhận minh bạch.

## 18. Lỗi gặp phải và cách khắc phục

- Source cũ có README conflict marker: viết lại README hoàn chỉnh.
- Source cũ trộn Expo Router và React Navigation: giữ một kiến trúc Expo Router.
- Tạo user ở client làm đổi phiên Admin: chuyển sang Callable Functions + Admin SDK.
- Firebase config hardcode: chuyển sang `EXPO_PUBLIC_FIREBASE_*` và `.env` bị ignore.
- Auth React Native không bền vững: khởi tạo persistence bằng AsyncStorage.
- TypeScript SDK 58 không lộ type React Native persistence theo condition: bổ sung module augmentation đúng chữ ký runtime.
- Chuỗi tiếng Việt cũ bị mojibake: viết lại toàn bộ UI mới bằng UTF-8.

## 19. Kết luận

Ứng dụng đã được chuyển thành hệ thống quản lý người dùng theo đúng bốn trường dữ liệu, có UI đầy đủ và kiến trúc Firebase an toàn. Phần còn lại trước khi nộp là deploy vào project thật, cấp claim Admin, chạy đủ kịch bản trên iPhone và bổ sung ảnh/video chứng minh.

## 20. Link GitHub và video demo

- GitHub: https://github.com/CrissNguyenKhanh/Product-Management-App
- Video demo: `[CHƯA CUNG CẤP — bổ sung URL thật sau khi quay]`

## Phụ lục: tiêu chí nghiệm thu thủ công

- [ ] Đăng nhập đúng/sai.
- [ ] Chặn non-Admin.
- [ ] Thêm hợp lệ, email trùng, thiếu dữ liệu.
- [ ] Danh sách, chi tiết, tìm kiếm, refresh.
- [ ] Sửa username/email/password.
- [ ] Chọn, upload, thay, xóa ảnh.
- [ ] Hủy xóa và xác nhận xóa.
- [ ] Đăng xuất và mở lại app.
- [ ] Mất mạng, permission denied, session expired.

## Mức độ đáp ứng đề thi

| Tiêu chí | Mức độ hiện tại |
|---|---|
| Đăng nhập và chặn non-Admin | Hoàn thành source; cần test với claim thật |
| Thêm người dùng | Hoàn thành client + Callable Function; cần deploy/test thật |
| Danh sách và tìm kiếm | Hoàn thành realtime Firestore, refresh/loading/error/empty |
| Xem chi tiết | Hoàn thành, password luôn che |
| Chỉnh sửa username/email/password | Hoàn thành source; cần deploy/test Auth thật |
| Xóa Auth/Firestore/Storage | Hoàn thành source và xác nhận; cần deploy/test thật |
| Chọn/hiển thị/thay/xóa ảnh | Hoàn thành source Expo SDK 58; cần test thư viện iPhone/Storage |
| Đúng bốn trường dữ liệu | Đạt ở type, create và update backend |
| Không lưu plaintext password | Đạt; chỉ lưu sentinel, password thật do Auth quản lý |
| Giao diện/Safe Area | Hoàn thành code; chưa xác minh trực quan trên iPhone thật |
| Expo SDK 58/TypeScript/lint | Đạt kiểm tra tĩnh và iOS bundle |
| README/báo cáo/hướng dẫn ảnh | Hoàn thành, giữ placeholder cho nội dung chưa có |
