# User Management App — React Native & Firebase

Ứng dụng quản lý người dùng dành cho Admin, xây dựng bằng React Native, Expo SDK 58 và Firebase. Admin có thể đăng nhập, xem dashboard, tìm kiếm, thêm, xem, sửa, đổi mật khẩu, chọn ảnh đại diện và xóa người dùng.

## Chức năng chính

- Đăng nhập Admin bằng Firebase Authentication và kiểm tra custom claim `admin`.
- Duy trì phiên đăng nhập trên React Native bằng AsyncStorage.
- Dashboard hiển thị email Admin và tổng số người dùng thật từ Firestore.
- Danh sách realtime, tìm theo username/email, pull-to-refresh, loading/error/empty state.
- Tạo tài khoản mà không làm mất phiên đăng nhập Admin.
- Sửa username, email, ảnh và đặt mật khẩu mới.
- Xem chi tiết với password được che bằng `********`.
- Xóa có xác nhận, đồng thời dọn Firebase Auth, Firestore và Storage.
- Ảnh được chọn từ thư viện iPhone, nén trước khi upload và có placeholder khi trống.
- Callable Cloud Functions kiểm tra quyền Admin ở server.

## Công nghệ

- Expo SDK 58, React Native 0.88, React 19, TypeScript 6
- Expo Router
- Firebase Authentication, Cloud Firestore, Cloud Storage
- Firebase Callable Cloud Functions v2 và Firebase Admin SDK
- Expo Image Picker, Image Manipulator, File System
- React Native Safe Area Context

## Kiến trúc bảo mật

```text
Expo app (Admin)
  ├─ Firebase Auth ──> đăng nhập + custom claim admin
  ├─ Firestore ─────> chỉ Admin được đọc collection users
  ├─ Storage ───────> chỉ Admin được đọc/ghi avatars/{uid}
  └─ Callable Functions
       ├─ createManagedUser
       ├─ updateManagedUser
       └─ deleteManagedUser
             └─ Admin SDK quản lý tài khoản Auth
```

Client không được ghi trực tiếp vào `users`. Admin SDK trong Cloud Functions ghi document với đúng bốn trường:

```json
{
  "username": "nguyenvana",
  "email": "user@gmail.com",
  "password": "[managed-by-firebase-auth]",
  "image": ""
}
```

Document ID là Firebase Auth UID. Không có trường `id`, `role`, timestamp hoặc dữ liệu sản phẩm. Mật khẩu thật và hash mật khẩu không được lưu vào Firestore; Firebase Authentication quản lý toàn bộ thông tin xác thực.

## Yêu cầu môi trường

- Node.js 22 và npm
- Expo Go tương thích SDK 58 trên iPhone
- Firebase project `product-management-app-239fa`
- Firebase CLI để deploy
- Google Cloud CLI hoặc thông tin xác thực ADC để chạy script cấp Admin

Cloud Functions và Cloud Storage thường yêu cầu bật billing/Blaze plan. Hãy kiểm tra chính sách hiện hành của Firebase project trước khi deploy.

## Cài đặt

```powershell
git clone https://github.com/CrissNguyenKhanh/Product-Management-App.git
cd Product-Management-App
npm install
npm --prefix functions install
Copy-Item .env.example .env
```

Điền `.env` bằng Firebase Web App config trong Firebase Console → Project settings → General. `.env` đã được gitignore. Không đặt service-account JSON, private key hoặc Admin credential vào biến `EXPO_PUBLIC_*`.

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=product-management-app-239fa.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=product-management-app-239fa
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=product-management-app-239fa.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION=asia-southeast1
```

Firebase Web API key là thông tin nhận diện client, không phải Admin secret; quyền truy cập thực tế vẫn do Auth, custom claims và Security Rules kiểm soát.

## Cấu hình Firebase

1. Trong Authentication → Sign-in method, bật Email/Password.
2. Tạo Cloud Firestore database.
3. Tạo Cloud Storage bucket.
4. Xác nhận project mặc định trong `.firebaserc` là `product-management-app-239fa`.
5. Cài Firebase CLI và đăng nhập:

```powershell
npx firebase-tools login
npx firebase-tools use product-management-app-239fa
```

6. Deploy backend và rules:

```powershell
npm --prefix functions run build
npx firebase-tools deploy --only functions,firestore:rules,storage
```

Callable Functions được deploy ở region `asia-southeast1`; giá trị này phải trùng với `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION`.

## Thiết lập Admin đầu tiên

Không hardcode email Admin trong app và không thêm trường `role` vào Firestore.

1. Firebase Console → Authentication → Users → Add user.
2. Đăng nhập Application Default Credentials bằng tài khoản có quyền quản lý Firebase Auth:

```powershell
gcloud auth application-default login
$env:GOOGLE_CLOUD_PROJECT="product-management-app-239fa"
npm --prefix functions run set-admin -- admin@example.com
```

3. Đăng xuất rồi đăng nhập lại app để token nhận claim mới.

Nếu dùng service account, lưu JSON bên ngoài repository và đặt `GOOGLE_APPLICATION_CREDENTIALS` tới đường dẫn đó. Không copy khóa vào source hoặc commit Git.

## Chạy trên iPhone bằng Expo Go

Đảm bảo máy tính và iPhone dùng cùng mạng Wi-Fi:

```powershell
npm install
npx expo start --clear
```

Mở Expo Go tương thích SDK 58, quét QR ở chế độ LAN. Nếu mạng nội bộ chặn LAN, có thể thử:

```powershell
npx expo start --clear --tunnel
```

Sau khi đổi `.env`, dừng Metro và chạy lại với `--clear`.

## Kiểm tra chất lượng

```powershell
npx expo install --check
npm run typecheck
npm run lint
npm run functions:build
npx expo-doctor
```

Các thao tác Auth/Firestore/Storage thực tế chỉ có thể kiểm thử đầy đủ sau khi deploy Functions/rules, cấp custom claim và dùng Firebase project có billing phù hợp.

`npm audit --omit=dev` hiện còn cảnh báo transitive từ Expo Fingerprint và Firebase Firestore/gRPC. Đề xuất tự động của npm là downgrade Expo/Firebase sang major cũ, không tương thích SDK 58, nên dự án không dùng `npm audit fix --force`; cần theo dõi bản vá upstream. Backend Functions dùng Firebase Admin SDK 14.5 và audit riêng hiện không còn cảnh báo.

## Kịch bản demo giữa kỳ

1. Đăng nhập sai và quan sát thông báo lỗi.
2. Đăng nhập bằng tài khoản Admin.
3. Xem tổng người dùng trên Dashboard.
4. Mở danh sách, tìm kiếm và pull-to-refresh.
5. Thêm người dùng có ảnh; thử thêm email trùng.
6. Mở chi tiết, xác nhận password luôn bị che.
7. Sửa username/email, thay ảnh và đặt mật khẩu mới.
8. Mở lại app để kiểm tra phiên đăng nhập.
9. Hủy xóa một lần, sau đó xác nhận xóa.
10. Đăng xuất.

## Tài liệu

- [Báo cáo giữa kỳ](docs/BAO_CAO_GIUA_KY.md)
- [Hướng dẫn chụp ảnh minh họa trên iPhone](docs/HUONG_DAN_CHUP_ANH_IPHONE.md)

## Lưu ý vận hành

- Không gọi `createUserWithEmailAndPassword` từ phiên Admin; tạo tài khoản qua Callable Function.
- Không thay giá trị sentinel password bằng password thật hoặc password hash.
- Không nới rules thành `allow read, write: if true`.
- Không dùng service account trong ứng dụng Expo.
- Admin đang đăng nhập không được tự xóa chính mình.

## Liên kết

- GitHub: https://github.com/CrissNguyenKhanh/Product-Management-App
- Video demo: `[CHƯA CUNG CẤP — bổ sung link sau khi quay]`
## Credits & Acknowledgments

This project builds upon earlier work with
contributions from @Lethailam.

The User Management version was subsequently
developed and adapted by the current maintainers.

The original Git history is preserved in the
`archive-original-history` branch.