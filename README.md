# User Management App — React Native & Firebase

Ứng dụng di động dành cho Admin để quản lý tài khoản người dùng trên Firebase. Source được xây dựng bằng Expo SDK 58, TypeScript, Expo Router và Firebase; dữ liệu chính không dùng mock.

## Chức năng

- Đăng nhập Admin bằng Firebase Authentication và kiểm tra custom claim `admin`.
- Dashboard hiển thị email Admin và tổng số người dùng theo thời gian thực.
- Danh sách người dùng, tìm kiếm theo username/email và pull-to-refresh.
- Xem chi tiết, thêm, sửa và xóa người dùng.
- Chọn ảnh từ thư viện, xem trước và tải ảnh lên Firebase Storage.
- Đổi email, username, ảnh và mật khẩu bằng backend có Firebase Admin SDK.
- Loading, empty state, validation, xác nhận xóa và thông báo lỗi rõ ràng.

## Mô hình bảo mật

Ứng dụng client không tạo tài khoản phụ bằng `createUserWithEmailAndPassword`, vì thao tác đó sẽ thay phiên đăng nhập hiện tại. Các thao tác đặc quyền đi qua callable Cloud Functions:

1. Client gửi Firebase ID token tự động qua Firebase Functions SDK.
2. Function kiểm tra `request.auth.token.admin === true`.
3. Firebase Admin SDK thực hiện tạo/cập nhật/xóa tài khoản Authentication.
4. Function đồng bộ document Firestore theo đúng bốn trường của đề.

Mật khẩu thật chỉ tồn tại trong Firebase Authentication. Firestore chỉ lưu giá trị đại diện không nhạy cảm:

```json
{
  "username": "nguyenvana",
  "email": "user@example.com",
  "password": "[managed-by-firebase-auth]",
  "image": ""
}
```

Firebase Auth UID được dùng làm document ID. Không có trường `id`, `role`, `createdAt` hoặc dữ liệu ngoài bốn trường trên trong document người dùng.

## Kiến trúc

```text
Expo app
  ├─ Firebase Authentication ── đăng nhập Admin + custom claim
  ├─ Cloud Firestore ────────── đọc danh sách/chi tiết users
  ├─ Cloud Storage ──────────── avatar users/{uid}/...
  └─ Callable Functions ─────── CRUD Auth + ghi Firestore bằng Admin SDK
```

Các thư mục chính:

```text
src/app/          Màn hình và route Expo Router
src/components/   Thành phần giao diện dùng lại
src/config/       Khởi tạo Firebase duy nhất
src/contexts/     Trạng thái đăng nhập Admin
src/services/     Firestore, callable Functions và Storage
src/models/       Kiểu dữ liệu người dùng
src/utils/        Validation và ánh xạ lỗi
functions/src/    Backend Firebase Admin SDK
docs/             Báo cáo và hướng dẫn demo
```

## Yêu cầu môi trường

- Node.js 22.13 trở lên.
- npm.
- Expo Go tương thích SDK 58 trên iPhone.
- Firebase CLI nếu deploy backend/rules: `npm install -g firebase-tools`.
- Firebase project `product-management-app-239fa`.
- Blaze plan để deploy Cloud Functions và sử dụng Cloud Storage theo yêu cầu hiện tại của Firebase.

## Cài đặt

```powershell
git clone https://github.com/CrissNguyenKhanh/Product-Management-App.git
cd Product-Management-App
git switch original-rebuild
npm install
npm --prefix functions install
Copy-Item .env.example .env
```

Firebase Web config đã được đặt trong `.env.example`. Firebase Web API key là định danh phía client, không phải service-account private key. Không commit service-account JSON hoặc private key.

## Cấu hình Firebase

Trong Firebase Console:

1. Bật Authentication → Sign-in method → Email/Password.
2. Tạo Cloud Firestore database.
3. Bật Storage nếu cần avatar.
4. Chọn Blaze plan trước khi deploy Functions/Storage nếu Firebase yêu cầu.
5. Đăng nhập Firebase CLI và chọn đúng project:

```powershell
firebase login
firebase use product-management-app-239fa
```

Deploy backend và security rules:

```powershell
npm --prefix functions run build
firebase deploy --only functions
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Functions được triển khai tại region `asia-southeast1`. Client dùng cùng region qua `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION`.

## Tạo Admin đầu tiên

1. Tạo một tài khoản Email/Password trong Firebase Authentication Console.
2. Tải service-account JSON về một thư mục riêng ngoài repository.
3. Trong PowerShell hiện tại, trỏ Application Default Credentials đến file đó:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\secure\product-management-admin.json'
npm --prefix functions run set-admin -- admin@example.com
```

4. Đăng xuất và đăng nhập lại để ID token nhận custom claim mới.

Script không hardcode email Admin và giữ lại các custom claims hiện có.

## Chạy trên iPhone bằng Expo Go

```powershell
npm install
npx expo start --clear
```

Sau đó mở Expo Go trên iPhone, bảo đảm máy tính và điện thoại cùng mạng, rồi quét QR. Nếu mạng LAN chặn kết nối, dùng:

```powershell
npx expo start --tunnel --clear
```

## Kiểm tra source

```powershell
npm run verify
npx expo install --check
npx expo-doctor
npm audit --omit=dev
```

Kết quả gần nhất ngày 12/11/2026:

- TypeScript app: đạt.
- ESLint: đạt.
- Cloud Functions TypeScript build: đạt.
- Expo dependency check: đạt.
- Expo Doctor: 20/20 checks đạt.
- Production dependency audit: 0 vulnerabilities.
- Cloud Functions production audit: 0 vulnerabilities.
- Expo Router web export: đạt.
- Metro `expo start --clear`: khởi động thành công và tạo QR Expo Go.

Kiểm thử end-to-end trên iPhone và Firebase production cần thực hiện sau khi Functions, rules, Storage và tài khoản Admin đầu tiên đã được cấu hình. Không xem các bước đó là đã đạt khi chưa chạy thực tế.

## Kịch bản demo giữa kỳ

1. Đăng nhập sai và quan sát thông báo lỗi.
2. Đăng nhập Admin thành công.
3. Xem tổng người dùng trên Dashboard.
4. Thêm người dùng với ảnh đại diện.
5. Tìm kiếm và mở màn hình chi tiết.
6. Sửa username/email, thay ảnh và đặt mật khẩu mới.
7. Thử hủy xóa, sau đó xác nhận xóa.
8. Đăng xuất và mở lại ứng dụng để kiểm tra phiên đăng nhập.

Xem thêm [báo cáo giữa kỳ](docs/BAO_CAO_GIUA_KY.md) và [hướng dẫn chụp ảnh iPhone](docs/HUONG_DAN_CHUP_ANH_IPHONE.md).
