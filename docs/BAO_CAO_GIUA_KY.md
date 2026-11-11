# BÁO CÁO GIỮA KỲ

## USER MANAGEMENT APP — QUẢN LÝ HỒ SƠ NGƯỜI DÙNG TRÊN FIREBASE SPARK

> Môn học: Lập trình đa nền tảng
>
> Repository: https://github.com/CrissNguyenKhanh/Product-Management-App
>
> Nhánh: `original-rebuild`
>
> Video demo: `[CHƯA CUNG CẤP — bổ sung sau khi quay]`

## 1. Giới thiệu

User Management App là ứng dụng React Native cho phép Admin quản lý các hồ sơ demo trong Cloud Firestore. Phiên bản hiện tại được thiết kế cho Firebase Spark miễn phí, không dùng Cloud Functions và Firebase Storage.

Điểm quan trọng về phạm vi: chỉ tài khoản Admin hiện có đăng nhập bằng Firebase Authentication. Các document trong collection `users` không phải tài khoản Authentication, không thể đăng nhập và không có chức năng tạo/đổi mật khẩu/xóa tài khoản Auth.

## 2. Mục tiêu

- Đăng nhập Admin và kiểm tra custom claim `admin: true`.
- Thêm, hiển thị thời gian thực, tìm kiếm, xem, sửa và xóa hồ sơ.
- Chọn ảnh từ iPhone, nén JPEG và lưu lâu dài mà không cần Storage.
- Không thu thập hoặc lưu mật khẩu thật.
- Bảo vệ toàn bộ dữ liệu bằng Firestore Security Rules.
- Tương thích Expo SDK 58 và Expo Go.

## 3. Công nghệ

- React Native 0.88, React 19.3 và TypeScript 6.
- Expo SDK 58, Expo Router, Expo Image Picker, Expo Image Manipulator.
- Firebase Authentication cho phiên Admin.
- Cloud Firestore Client SDK cho CRUD và listener thời gian thực.
- ESLint và Expo tooling.

## 4. Kiến trúc

```text
iPhone / Expo Go
       │
       ├── Firebase Authentication
       │      └── đăng nhập Admin hiện có + custom claim
       │
       └── Cloud Firestore Client SDK
              └── users/{documentId}
                    ├── username
                    ├── email
                    ├── password = [demo-no-login]
                    └── image = JPEG data URI hoặc ""
```

Không có backend Functions, Admin SDK hay Storage trong ứng dụng. Quyền truy cập được kiểm tra ở cả giao diện (`AdminGate`) và Firestore Rules; client không thể tự cấp quyền Admin.

## 5. Cấu trúc source

| Vị trí | Vai trò |
|---|---|
| `src/app` | Login, Dashboard, danh sách, form và chi tiết |
| `src/components` | Thành phần giao diện dùng lại |
| `src/config/firebase.*` | Khởi tạo duy nhất Auth và Firestore |
| `src/contexts/auth-context.tsx` | Theo dõi phiên và kiểm tra custom claim |
| `src/services/user-service.ts` | Firestore Client CRUD và listener |
| `src/services/image-service.ts` | Chọn, resize, nén và tạo JPEG data URI |
| `src/models/user.ts` | Kiểu dữ liệu, placeholder và giới hạn ảnh |
| `firestore.rules` | Phân quyền Admin và kiểm tra schema |

## 6. Cấu trúc dữ liệu

Collection nghiệp vụ duy nhất là `users`. Firestore tự tạo document ID làm định danh kỹ thuật. Document có đúng bốn trường:

```json
{
  "username": "nguyenvana",
  "email": "user@example.com",
  "password": "[demo-no-login]",
  "image": "data:image/jpeg;base64,..."
}
```

Không có `id`, `uid`, `role`, `createdAt` hoặc trường nghiệp vụ nào khác bên trong document.

## 7. Password demo

Form hiển thị trường khóa `[demo-no-login]` để đáp ứng mô hình bốn trường nhưng không nhận dữ liệu nhạy cảm. Service luôn tự ghi đúng chuỗi đại diện này, và Rules từ chối giá trị khác. Đây không phải password hash và không liên quan đến mật khẩu Admin.

## 8. Đăng nhập Admin

Màn hình Login dùng `signInWithEmailAndPassword` cho tài khoản Admin hiện có. Sau đăng nhập, app lấy ID token và chỉ tiếp tục nếu `claims.admin === true`; tài khoản không có claim bị đăng xuất. CRUD hồ sơ không gọi bất kỳ API quản trị Authentication nào nên không tạo, đổi hoặc xóa tài khoản Auth.

## 9. CRUD Firestore Client

- Thêm: `addDoc(collection(db, 'users'), data)`.
- Danh sách: `onSnapshot` để cập nhật thời gian thực; `getDocs` cho pull-to-refresh.
- Chi tiết: `getDoc` theo document ID.
- Sửa: `updateDoc` và luôn ghi lại đủ bốn trường hợp lệ.
- Xóa: `deleteDoc` chỉ xóa document Firestore.

Dashboard đếm số document từ listener. Tìm kiếm username/email thực hiện cục bộ trên danh sách đã tải.

## 10. Ảnh đại diện không dùng Storage

Expo Image Picker xin quyền thư viện và crop ảnh tỉ lệ 1:1. Expo Image Manipulator resize và nén ảnh thành JPEG qua nhiều mức từ 512 px xuống 192 px. Kết quả được ghép prefix `data:image/jpeg;base64,` và chỉ chấp nhận khi không quá 180.000 ký tự.

Data URI được lưu trong trường `image`, vì vậy ảnh vẫn hiển thị sau khi đóng/mở ứng dụng. Nếu mọi mức nén vẫn vượt giới hạn, app báo lỗi và yêu cầu chọn ảnh khác. Chuỗi rỗng biểu thị không có ảnh.

## 11. Firestore Security Rules

Rules áp dụng các điều kiện:

- Mọi read/create/update/delete trong `users` cần `request.auth.token.admin == true`.
- Create/update phải có đúng `username`, `email`, `password`, `image`.
- Kiểm tra kiểu string và giới hạn username, email, image.
- `password` bắt buộc bằng `[demo-no-login]`.
- `image` phải rỗng hoặc là JPEG data URI base64, tối đa 180.000 ký tự.
- Mọi collection/path khác bị từ chối mặc định.

## 12. Firebase Spark và giới hạn miễn phí

Phiên bản này không cần Blaze. Firestore cung cấp một database miễn phí cho mỗi project với quota: 1 GiB dữ liệu, 50.000 document reads/ngày, 20.000 writes/ngày, 20.000 deletes/ngày và 10 GiB outbound/tháng. Quota hằng ngày được reset khoảng nửa đêm theo giờ Thái Bình Dương.

Khi dùng Spark, vượt quota sẽ làm thao tác bị giới hạn; muốn tăng quota phải bật billing. Các tính năng như TTL deletes, point-in-time recovery, backup, restore và clone không thuộc free usage và không được dùng trong dự án.

Ảnh base64 làm document lớn hơn và được tải lại khi đọc hồ sơ, nên tiêu tốn data transfer/reads nhanh hơn URL ảnh. Giải pháp phù hợp bài tập và ảnh avatar nhỏ, không phù hợp thư viện ảnh lớn.

Cloud Storage for Firebase hiện yêu cầu Blaze để sử dụng default bucket, vì vậy dự án loại bỏ hoàn toàn Storage. Cloud Functions cũng không cần thiết vì ứng dụng chỉ CRUD hồ sơ demo, không quản trị tài khoản Auth.

## 13. Cấu hình và triển khai

Giữ nguyên tài khoản Admin và custom claim đã có. Cấu hình client nằm trong `.env`; source mẫu ở `.env.example`.

```powershell
npm install
Copy-Item .env.example .env
firebase login
firebase use product-management-app-239fa
firebase deploy --only firestore:rules,firestore:indexes
```

Không deploy Functions/Storage, không dùng `--force`, không nâng Expo và không xóa Firebase project/dữ liệu hiện có.

## 14. Chạy và kiểm tra

```powershell
npm install
npx expo install --check
npx tsc --noEmit
npm run lint
npx expo start --clear
```

Trên iPhone, mở Expo Go tương thích SDK 58 và quét QR. Có thể dùng `npx expo start --tunnel --clear` nếu mạng LAN chặn kết nối.

## 15. Kết quả và giới hạn kiểm thử

Kết quả kiểm tra source ngày 12/11/2026:

| Kiểm tra | Kết quả |
|---|---|
| `npm install` | Đạt, dependency đã đồng bộ |
| `npx expo install --check` | Dependencies are up to date |
| `npx tsc --noEmit` | Đạt, không có lỗi TypeScript |
| `npm run lint` | Đạt, không có lỗi ESLint |
| `npx expo export --platform web` | Đạt, bundle và 8 static routes thành công |

Kiểm thử production cuối cùng vẫn cần rules đã deploy, tài khoản Admin thật và iPhone kết nối. Báo cáo không coi các ca end-to-end Firebase/iPhone là đã đạt khi chưa thực hiện thủ công.

Ứng dụng không tuyên bố đã triển khai Firebase Authentication CRUD. Chức năng Auth duy nhất là đăng nhập/đăng xuất Admin hiện có.

## 16. Kịch bản nghiệm thu

- [ ] Admin đăng nhập đúng; tài khoản không có claim bị chặn.
- [ ] Dashboard hiển thị tổng hồ sơ.
- [ ] Thêm hồ sơ với đúng bốn trường và password placeholder.
- [ ] Chọn ảnh, lưu và mở lại app vẫn hiển thị ảnh.
- [ ] Ảnh quá giới hạn có thông báo chọn lại.
- [ ] Tìm kiếm, xem chi tiết và sửa hồ sơ.
- [ ] Hủy xóa và xác nhận xóa chỉ document Firestore.
- [ ] Đăng xuất không ảnh hưởng tài khoản Admin.
- [ ] Rules từ chối người không phải Admin và collection khác.

## 17. Liên kết

- GitHub: https://github.com/CrissNguyenKhanh/Product-Management-App/tree/original-rebuild
- Video demo: `[CHƯA CUNG CẤP — bổ sung URL thật sau khi quay]`
