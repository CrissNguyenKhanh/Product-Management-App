# BÁO CÁO GIỮA KỲ

## USER MANAGEMENT APP — ỨNG DỤNG QUẢN LÝ NGƯỜI DÙNG DÀNH CHO ADMIN

> Môn học: Lập trình đa nền tảng  
> Repository: https://github.com/CrissNguyenKhanh/Product-Management-App  
> Nhánh source viết lại: `original-rebuild`  
> Video demo: `[CHƯA CUNG CẤP — bổ sung sau khi quay]`  
> Ảnh minh họa thực tế: `[CHƯA CHỤP — thực hiện theo HUONG_DAN_CHUP_ANH_IPHONE.md]`

## 1. Giới thiệu đề tài

User Management App là ứng dụng React Native cho phép Admin quản lý tài khoản người dùng bằng Firebase. Ứng dụng tập trung vào CRUD người dùng, ảnh đại diện, xác thực Admin và bảo vệ mật khẩu đúng cách.

Source ở nhánh `original-rebuild` được khởi tạo từ mẫu Expo SDK 58 chính thức và triển khai độc lập theo yêu cầu đề bài.

## 2. Mục tiêu

- Hoàn thành thêm, hiển thị, xem, sửa và xóa người dùng.
- Đăng nhập và giới hạn toàn bộ chức năng quản trị cho Admin.
- Chọn/hiển thị ảnh từ điện thoại và lưu ảnh lâu dài trên Firebase Storage.
- Không lưu plaintext password trong Firestore.
- Tương thích Expo SDK 58 và Expo Go trên iPhone.
- Có loading, validation, empty/error state, xác nhận thao tác nguy hiểm.

## 3. Công nghệ sử dụng

- React 19.3, React Native 0.88 và TypeScript 6.
- Expo SDK 58, Expo Router và Expo Image Picker.
- Firebase Authentication, Cloud Firestore, Cloud Storage.
- Firebase Callable Cloud Functions chạy Node.js 22.
- Firebase Admin SDK và custom claims.
- ESLint, Expo Doctor và npm audit.

## 4. Kiến trúc hệ thống

```text
iPhone / Expo Go
       │
       ├── Firebase Auth ───── đăng nhập Admin
       ├── Firestore ───────── đọc collection users
       ├── Storage ─────────── upload/hiển thị avatar
       └── Callable Functions
               │ kiểm tra request.auth.token.admin
               ├── Admin Auth SDK
               ├── Admin Firestore SDK
               └── Admin Storage SDK
```

Client không được tin cậy để tự quyết định quyền. Custom claim được kiểm tra lại trong từng function. Firestore client chỉ có quyền đọc khi token có `admin: true`; ghi dữ liệu chỉ thực hiện qua Admin SDK.

## 5. Cấu trúc source code

| Vị trí | Vai trò |
|---|---|
| `src/app` | Login, Dashboard, danh sách, form và chi tiết |
| `src/components` | Button, input, avatar, guard và state dùng lại |
| `src/config/firebase.ts` | Khởi tạo duy nhất Auth, Firestore, Storage, Functions |
| `src/contexts/auth-context.tsx` | Theo dõi phiên và custom claim Admin |
| `src/services` | Firestore, callable Functions, Image Picker/Storage |
| `src/models/user.ts` | Kiểu dữ liệu bốn trường |
| `src/utils` | Validation và thông báo lỗi Firebase |
| `functions/src` | Backend quản trị bằng Admin SDK |
| `*.rules` | Firestore/Storage Security Rules |

## 6. Tạo và cấu hình Firebase

Firebase project sử dụng là `product-management-app-239fa`. Cấu hình Web client được đọc từ biến `EXPO_PUBLIC_FIREBASE_*` trong `.env`; file mẫu nằm ở `.env.example`.

Các bước thủ công:

1. Bật Email/Password Authentication.
2. Tạo Firestore database.
3. Bật Storage và nâng Blaze plan nếu được yêu cầu.
4. Deploy Functions và rules bằng Firebase CLI.
5. Tạo tài khoản Admin đầu tiên và chạy script `functions/src/scripts/set-admin.ts`.

Không đưa service-account JSON/private key vào source.

## 7. Cấu trúc dữ liệu

Collection duy nhất cho nghiệp vụ là `users`. Document ID chính là Firebase Auth UID và document có đúng bốn trường:

```json
{
  "username": "nguyenvana",
  "email": "user@example.com",
  "password": "[managed-by-firebase-auth]",
  "image": "https://... hoặc chuỗi rỗng"
}
```

Backend ghi document bằng `set` không merge để tránh tồn tại trường nghiệp vụ dư thừa.

## 8. Quản lý password an toàn

Form thêm người dùng và đổi mật khẩu vẫn có ô password theo đề, nhưng giá trị thật được gửi qua kết nối Firebase callable và chỉ giao cho Firebase Authentication. Firestore không lưu plaintext hoặc password hash; trường `password` luôn là `[managed-by-firebase-auth]`. Danh sách và chi tiết chỉ hiển thị `********`.

## 9. Đăng nhập Admin

Màn hình Login kiểm tra định dạng email, loading và lỗi Firebase. Sau khi đăng nhập, app làm mới ID token và kiểm tra custom claim `admin`. Tài khoản không có claim bị đăng xuất ngay. `AdminGate` chặn truy cập trực tiếp các route quản trị.

## 10. Thêm người dùng

Admin nhập chính xác username, email, password và ảnh tùy chọn. Callable Function tạo Firebase Auth user trước, sau đó tạo Firestore document bằng cùng UID. Nếu ghi Firestore lỗi, backend cố gắng rollback tài khoản Auth. Nút submit bị khóa trong lúc xử lý.

## 11. Hiển thị danh sách

Danh sách dùng listener Firestore thật để nhận cập nhật. Có avatar/placeholder, username, email, password che, tìm kiếm cục bộ không phân biệt hoa thường, pull-to-refresh, loading, empty state và error state.

## 12. Sửa người dùng

Admin có thể đổi username, email, ảnh hoặc đặt mật khẩu mới. Backend dùng `updateUser` của Admin SDK rồi ghi lại Firestore document đúng bốn trường. Mật khẩu mới là tùy chọn trên form sửa.

## 13. Xóa người dùng

Ứng dụng hiển thị hộp thoại Cancel/Delete. Function cố gắng xóa toàn bộ file dưới `users/{uid}/`, sau đó xóa Firebase Auth user và Firestore document. Danh sách cập nhật qua listener sau khi thao tác thành công.

## 14. Chọn và hiển thị ảnh

Expo Image Picker xin quyền thư viện, chỉ chọn một ảnh, crop tỉ lệ 1:1 và nén chất lượng 0.75. Client chặn file lớn hơn 5 MB; Storage Rules kiểm tra lại kích thước và MIME type. URL tải về được lưu ở trường `image`; chuỗi rỗng biểu thị không có ảnh.

## 15. Chức năng nâng cao

- Dashboard đếm người dùng thời gian thực.
- Tìm kiếm username/email.
- Duy trì phiên Firebase Auth bằng AsyncStorage.
- Ánh xạ lỗi mất mạng, permission denied, email trùng và phiên hết hạn.
- Custom claims thay vì thêm trường role vào Firestore.
- Production dependency overrides cho các bản vá bảo mật gián tiếp đã được audit.

## 16. Lệnh cài đặt và chạy

```powershell
npm install
npm --prefix functions install
Copy-Item .env.example .env
npm run verify
npx expo start --clear
```

Deploy:

```powershell
firebase use product-management-app-239fa
firebase deploy --only functions
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 17. Kết quả kiểm tra thực tế

Kết quả kiểm tra tĩnh ngày 12/11/2026:

| Kiểm tra | Kết quả |
|---|---|
| `npx tsc --noEmit` | Đạt |
| `npx expo lint` | Đạt |
| Functions `tsc` | Đạt |
| `npx expo install --check` | Dependencies up to date |
| `npx expo-doctor` | 20/20 checks passed |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm --prefix functions audit --omit=dev` | 0 vulnerabilities |
| `npx expo export --platform web` | Bundle và 8 static routes thành công |
| `npx expo start --clear` | Metro khởi động và tạo QR thành công |

Chưa khẳng định các ca end-to-end Firebase/iPhone đã đạt vì phiên làm việc hiện tại chưa deploy Functions/rules, chưa cấu hình Admin đầu tiên và chưa có iPhone kết nối. Cần thực hiện bảng nghiệm thu ở phần phụ lục sau khi deploy.

## 18. Lỗi gặp phải và cách khắc phục

- Firebase 13 yêu cầu Node mới hơn môi trường: ghim Firebase client 12.10.0 tương thích Node 22.
- TypeScript không nhìn thấy export persistence theo điều kiện React Native: bổ sung khai báo type đúng runtime export, không dùng `any`.
- File demo mặc định của template gây lỗi và dependency thừa: loại bỏ route/component demo, giữ tối thiểu package cần thiết.
- Audit phát hiện dependency gián tiếp cũ: override có mục tiêu `@grpc/grpc-js` và `minimatch`; không dùng `npm audit fix --force` vì lệnh này đề xuất downgrade phá vỡ Expo/Firebase.

## 19. Kết luận

Source đã triển khai đầy đủ kiến trúc và giao diện cho yêu cầu CRUD người dùng, quản trị Admin, ảnh đại diện và password an toàn. Mã nguồn qua kiểm tra TypeScript, lint, Expo Doctor và production audit. Bước còn lại trước khi nộp là deploy Firebase, tạo Admin, chạy toàn bộ kịch bản trên iPhone và bổ sung ảnh/video thật.

## 20. Link GitHub và video demo

- GitHub: https://github.com/CrissNguyenKhanh/Product-Management-App/tree/original-rebuild
- Video demo: `[CHƯA CUNG CẤP — bổ sung URL thật sau khi quay]`

## Phụ lục: bảng nghiệm thu thủ công

Đánh dấu sau khi thực sự chạy trên iPhone/Firebase:

- [ ] Đăng nhập đúng.
- [ ] Đăng nhập sai có thông báo.
- [ ] Chặn tài khoản không có quyền Admin.
- [ ] Thêm người dùng hợp lệ.
- [ ] Chặn email trùng và dữ liệu thiếu.
- [ ] Hiển thị danh sách/chi tiết.
- [ ] Sửa username và email.
- [ ] Đặt mật khẩu mới.
- [ ] Chọn, upload, thay và xóa ảnh.
- [ ] Tìm kiếm người dùng.
- [ ] Hủy xóa và xác nhận xóa.
- [ ] Đăng xuất.
- [ ] Mở lại app và kiểm tra phiên.
- [ ] Kiểm tra lỗi mất mạng/permission denied.
