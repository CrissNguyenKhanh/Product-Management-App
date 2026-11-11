# User Management App — Firebase Spark

Ứng dụng React Native dành cho Admin để quản lý **hồ sơ người dùng demo** bằng Expo SDK 58, TypeScript, Expo Router và Firebase. Phiên bản này chạy trên gói Firebase Spark, không dùng Cloud Functions hoặc Firebase Storage.

## Phạm vi chức năng

- Firebase Authentication chỉ đăng nhập tài khoản Admin hiện có và kiểm tra custom claim `admin: true`.
- Dashboard, danh sách thời gian thực, tìm kiếm, pull-to-refresh, xem chi tiết, thêm, sửa và xóa hồ sơ.
- CRUD `users` thực hiện trực tiếp bằng Firestore Client SDK (`addDoc`, `getDoc`, `onSnapshot`, `updateDoc`, `deleteDoc`).
- Chọn ảnh trên iPhone bằng Expo Image Picker, nén thành JPEG và lưu data URI base64 trong Firestore.
- Đăng xuất, validation, loading/error/empty state và xác nhận trước khi xóa.

Ứng dụng **không** tạo, sửa mật khẩu hoặc xóa tài khoản Firebase Authentication cho các hồ sơ trong `users`. Tài khoản Admin hiện có không bị thay đổi bởi CRUD hồ sơ.

## Dữ liệu Firestore

Collection nghiệp vụ duy nhất là `users`. Mỗi document có đúng bốn trường:

```json
{
  "username": "nguyenvana",
  "email": "user@example.com",
  "password": "[demo-no-login]",
  "image": "data:image/jpeg;base64,..."
}
```

- Document ID do Firestore tạo và chỉ là định danh kỹ thuật.
- `password` luôn là chuỗi đại diện `[demo-no-login]`; app không thu thập hay lưu mật khẩu thật.
- Hồ sơ trong `users` không phải tài khoản đăng nhập.
- `image` là chuỗi rỗng hoặc JPEG data URI tối đa 180.000 ký tự. Ảnh nằm trong document nên vẫn hiển thị sau khi đóng/mở app.

## Kiến trúc và bảo mật

```text
Expo app
  ├─ Firebase Authentication ── đăng nhập Admin hiện có
  └─ Cloud Firestore
       └─ users/{documentId} ─── CRUD hồ sơ + JPEG data URI
```

Firestore Security Rules yêu cầu người dùng đã đăng nhập có `request.auth.token.admin == true` cho mọi thao tác đọc/ghi/xóa `users`. Rules chỉ chấp nhận đúng bốn trường, kiểm tra kiểu/độ dài, bắt buộc password đại diện và từ chối mọi collection khác.

## Giới hạn gói Spark

Thiết kế không cần billing account, Cloud Functions hay Cloud Storage. Ứng dụng chạy miễn phí khi nằm trong quota Firestore Spark: một database miễn phí mỗi project, 1 GiB dữ liệu, 50.000 lượt đọc/ngày, 20.000 lượt ghi/ngày, 20.000 lượt xóa/ngày và 10 GiB outbound/tháng. Khi vượt quota, thao tác bị giới hạn thay vì tự động tính phí; muốn tăng quota phải bật billing.

Vì ảnh base64 được lưu cùng document, mỗi lần đọc hồ sơ cũng tải dữ liệu ảnh. Giới hạn riêng 180.000 ký tự giúp giữ document nhỏ hơn giới hạn Firestore và phù hợp ứng dụng học tập; đây không phải phương án nên dùng cho ảnh độ phân giải cao hoặc hệ thống lớn.

## Cài đặt

Yêu cầu Node.js, npm và Expo Go hỗ trợ SDK 58.

```powershell
git clone https://github.com/CrissNguyenKhanh/Product-Management-App.git
cd Product-Management-App
git switch original-rebuild
npm install
Copy-Item .env.example .env
```

Firebase Web config trong `.env.example` là cấu hình client, không phải service-account private key. Không commit service-account JSON hoặc khóa riêng.

## Cấu hình Firebase

Trong Firebase Console:

1. Giữ nguyên tài khoản Admin Email/Password hiện có và custom claim `admin: true`.
2. Bật Email/Password Authentication nếu project chưa bật.
3. Tạo Cloud Firestore database.
4. Deploy Firestore Rules và indexes:

```powershell
firebase login
firebase use product-management-app-239fa
firebase deploy --only firestore:rules,firestore:indexes
```

Không cần bật Storage, deploy Functions hoặc nâng project lên Blaze. Sau khi custom claim Admin được thay đổi ngoài app, Admin phải đăng xuất/đăng nhập lại để token mới nhận claim.

## Chạy trên iPhone bằng Expo Go

```powershell
npm install
npx expo start --clear
```

Mở Expo Go trên iPhone, bảo đảm iPhone và máy tính cùng mạng rồi quét QR. Nếu LAN chặn kết nối:

```powershell
npx expo start --tunnel --clear
```

Đăng nhập bằng tài khoản Admin hiện có. Khi chọn ảnh, app crop 1:1, thử nhiều mức resize/nén JPEG và chỉ chấp nhận kết quả không quá 180.000 ký tự. Nếu vẫn quá giới hạn, app báo lỗi để chọn ảnh khác.

## Kiểm tra source

```powershell
npm install
npx expo install --check
npx tsc --noEmit
npm run lint
```

`npm run verify` chạy TypeScript và ESLint. Không dùng `--force` và không tự nâng Expo.

## Kịch bản demo

1. Đăng nhập Admin và xem Dashboard.
2. Thêm hồ sơ demo với username, email và ảnh.
3. Xác nhận `password` hiển thị `[demo-no-login]` và hồ sơ không có chức năng đăng nhập.
4. Tìm kiếm, xem chi tiết, sửa hồ sơ và thay ảnh.
5. Đóng/mở app để kiểm tra ảnh được tải lại từ Firestore.
6. Hủy rồi xác nhận xóa document.
7. Đăng xuất Admin.

Xem [báo cáo giữa kỳ](docs/BAO_CAO_GIUA_KY.md) và [hướng dẫn chụp ảnh iPhone](docs/HUONG_DAN_CHUP_ANH_IPHONE.md).
