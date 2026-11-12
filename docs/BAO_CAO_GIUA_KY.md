# BÁO CÁO GIỮA KỲ

## ỨNG DỤNG QUẢN LÝ GIẢNG VIÊN — QL HỌC PHẦN

> Môn học: Lập trình đa nền tảng
>
> Công nghệ: React Native, Expo SDK 58, TypeScript, Firebase
>
> Repository: https://github.com/CrissNguyenKhanh/Product-Management-App
>
> Nhánh: `original-rebuild`

## 1. Yêu cầu đề tài

Xây dựng ứng dụng trong phân hệ Admin để nhập, hiển thị, sửa và xóa giảng viên trong cơ sở dữ liệu QLHocPhan. Collection `GiangVien` bắt buộc có đúng các trường:

- `IDGV`: mã giảng viên.
- `Fullname`: họ và tên.
- `Image`: hình ảnh.
- `SumClass`: tổng số lớp.

Ứng dụng phải chạy được trên Web; phần chọn và hiển thị ảnh được trình diễn trên mobile.

## 2. Công nghệ

- React 19.3, React Native 0.88 và TypeScript 6.
- Expo SDK 58 và Expo Router.
- Firebase Authentication cho tài khoản Admin.
- Cloud Firestore cho dữ liệu collection `GiangVien`.
- Expo Image Picker và Expo Image Manipulator cho ảnh mobile.
- ESLint, TypeScript compiler và Expo tooling để kiểm tra source.

## 3. Kiến trúc

```text
Web / iPhone Expo Go
       │
       ├── Firebase Authentication
       │      └── đăng nhập Admin + custom claim
       │
       └── Cloud Firestore Client SDK
              └── GiangVien/{documentId}
                    ├── IDGV: string
                    ├── Fullname: string
                    ├── Image: string
                    └── SumClass: integer
```

Không sử dụng Cloud Functions hoặc Firebase Storage. Hình ảnh nhỏ được lưu dưới dạng JPEG data URI trong trường `Image`, phù hợp gói Firebase Spark và yêu cầu bài thi.

## 4. Cấu trúc source

| Vị trí | Vai trò |
|---|---|
| `src/app/dashboard.tsx` | Thống kê giảng viên và tổng số lớp |
| `src/app/lecturers.tsx` | Danh sách, tìm kiếm và xóa |
| `src/app/lecturer-form.tsx` | Form thêm/sửa bốn trường |
| `src/app/lecturer-detail.tsx` | Hiển thị chi tiết giảng viên |
| `src/models/lecturer.ts` | Kiểu dữ liệu đúng schema đề |
| `src/services/lecturer-service.ts` | Firestore CRUD, realtime và chống trùng IDGV |
| `src/services/image-service.ts` | Chọn, resize, nén ảnh JPEG |
| `src/hooks/use-lecturers.ts` | Listener và trạng thái danh sách |
| `firestore.rules` | Bảo mật Admin và kiểm tra schema |

## 5. Cấu trúc dữ liệu

Collection: `GiangVien`.

```json
{
  "IDGV": "GV001",
  "Fullname": "Nguyễn Văn An",
  "Image": "data:image/jpeg;base64,...",
  "SumClass": 5
}
```

Document ID do Firestore tự sinh, không được thêm vào dữ liệu. Source và Security Rules đều chỉ cho phép đúng bốn trường của đề.

## 6. Đăng nhập Admin

Admin đăng nhập bằng Email/Password của Firebase Authentication. App lấy ID token và kiểm tra custom claim `admin: true`; `AdminGate` bảo vệ các route quản trị. Firestore Rules kiểm tra lại claim ở phía server nên client không thể tự cấp quyền.

## 7. Thêm giảng viên

Form nhận:

- Mã giảng viên `IDGV`, tự chuẩn hóa chữ hoa.
- Họ tên `Fullname`.
- Ảnh `Image`, có thể để trống.
- Tổng số lớp `SumClass`, số nguyên không âm.

Service truy vấn để chặn `IDGV` trùng trước khi dùng `addDoc`. Nút submit có loading và lỗi được hiển thị bằng Alert.

## 8. Hiển thị và tìm kiếm

Danh sách dùng `onSnapshot` để cập nhật thời gian thực. Mỗi thẻ hiển thị ảnh, họ tên, mã giảng viên và tổng số lớp. Tìm kiếm cục bộ theo `IDGV` hoặc `Fullname`, không phân biệt hoa thường. Pull-to-refresh dùng `getDocs`.

## 9. Sửa và xóa

Màn hình sửa đọc document bằng `getDoc` và ghi bằng `updateDoc`. Khi đổi mã, service tiếp tục kiểm tra trùng `IDGV`. Xóa dùng `deleteDoc` sau hộp thoại xác nhận Cancel/Delete.

## 10. Hình ảnh trên mobile

Expo Image Picker xin quyền thư viện và cho crop ảnh 1:1. Expo Image Manipulator thử nhiều mức resize/nén JPEG từ 512 px xuống 192 px. Kết quả được lưu dưới dạng `data:image/jpeg;base64,...`, tối đa 180.000 ký tự.

Do ảnh nằm trực tiếp trong Firestore nên vẫn hiển thị sau khi đóng/mở app. Nếu ảnh vượt giới hạn sau mọi mức nén, app thông báo chọn ảnh khác.

## 11. Chức năng nâng cao

- Dashboard tổng số giảng viên và tổng `SumClass`.
- Realtime listener.
- Tìm kiếm theo mã/họ tên.
- Kiểm tra trùng mã giảng viên.
- Pull-to-refresh, loading, empty state và error state.
- Validation đồng bộ giữa form, service và Firestore Rules.
- Giao diện responsive dùng được trên Web và mobile.

## 12. Firestore Security Rules

Rules chỉ cho tài khoản có `request.auth.token.admin == true` đọc, tạo, sửa và xóa `GiangVien`. Create/update phải:

- Có đúng `IDGV`, `Fullname`, `Image`, `SumClass`.
- `IDGV` và `Fullname` là string trong giới hạn kích thước.
- `Image` rỗng hoặc JPEG data URI tối đa 180.000 ký tự.
- `SumClass` là integer từ 0 đến 10.000.
- Mọi collection khác bị từ chối mặc định.

## 13. Cài đặt và chạy

```powershell
npm install
Copy-Item .env.example .env
npx firebase-tools deploy --only firestore:rules,firestore:indexes
npm run web
```

Chạy mobile:

```powershell
npx expo start --clear
```

## 14. Kiểm tra source

```powershell
npm install
npx expo install --check
npx tsc --noEmit
npm run lint
```

Kết quả kiểm tra source ngày 12/11/2026:

| Kiểm tra | Kết quả |
|---|---|
| `npm install` | Đạt |
| `npx expo install --check` | Dependencies are up to date |
| `npx tsc --noEmit` | Đạt, không lỗi TypeScript |
| `npm run lint` | Đạt, không lỗi ESLint |
| `npx expo start --clear` | Metro khởi động và tạo QR thành công |
| `npx expo export --platform web` | Bundle thành công 8 static routes |

Kiểm thử end-to-end vẫn cần rules mới được deploy, Admin thật và trình duyệt/iPhone kết nối.

## 15. Dữ liệu nộp kèm

- Source GitHub trên nhánh `original-rebuild`.
- File JSON mẫu: `docs/GiangVien.sample.json`.
- Ảnh minh họa: thực hiện theo `docs/HUONG_DAN_CHUP_ANH_IPHONE.md`.
- Link video demo: `[BỔ SUNG SAU KHI QUAY]`.

## 16. Checklist nghiệm thu

- [ ] Đăng nhập Admin thành công.
- [ ] Web hiển thị Dashboard và danh sách.
- [ ] Thêm document đủ đúng bốn trường.
- [ ] Chặn IDGV trùng.
- [ ] Tìm kiếm theo IDGV/Fullname.
- [ ] Xem và sửa giảng viên.
- [ ] Hủy xóa và xác nhận xóa.
- [ ] Chọn ảnh trên iPhone và ảnh hiển thị sau khi mở lại app.
- [ ] Chụp Firestore collection `GiangVien`.
- [ ] Quay video demo và bổ sung link.
