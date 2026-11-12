# QL Học Phần — Quản lý giảng viên

Ứng dụng giữa kỳ React Native/Expo dùng Firebase để nhập, hiển thị, sửa và xóa giảng viên trong phân hệ Admin. Source bám đúng đề mới với collection `GiangVien` và đúng bốn trường `IDGV`, `Fullname`, `Image`, `SumClass`.

## Chức năng

- Đăng nhập Admin bằng Firebase Authentication và custom claim `admin: true`.
- Dashboard thống kê tổng giảng viên và tổng số lớp đang phụ trách.
- Danh sách thời gian thực, tìm kiếm theo mã hoặc họ tên, pull-to-refresh.
- Thêm, xem chi tiết, sửa và xóa giảng viên.
- Kiểm tra trùng `IDGV`, validation dữ liệu và xác nhận trước khi xóa.
- Chọn ảnh trên iPhone bằng Expo Image Picker; ảnh được nén JPEG và lưu bền vững trong Firestore.
- Chạy trên Web và mobile bằng Expo Go.

## Cấu trúc dữ liệu bắt buộc

Cơ sở dữ liệu nghiệp vụ: **QLHocPhan**. Collection duy nhất của đề: **`GiangVien`**.

```json
{
  "IDGV": "GV001",
  "Fullname": "Nguyễn Văn An",
  "Image": "data:image/jpeg;base64,...",
  "SumClass": 5
}
```

Firestore document ID chỉ là định danh kỹ thuật. Document không có thêm `id`, `email`, `password`, `role`, `createdAt` hoặc trường nào khác.

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `IDGV` | string | Mã giảng viên, 2–20 ký tự |
| `Fullname` | string | Họ và tên, 2–100 ký tự |
| `Image` | string | JPEG data URI hoặc chuỗi rỗng, tối đa 180.000 ký tự |
| `SumClass` | integer | Tổng số lớp, từ 0 đến 10.000 |

## Kiến trúc

```text
Expo Web / Expo Go
  ├─ Firebase Authentication ── đăng nhập Admin
  └─ Cloud Firestore
       └─ GiangVien/{documentId}
            ├─ IDGV
            ├─ Fullname
            ├─ Image
            └─ SumClass
```

CRUD dùng trực tiếp Firestore Client SDK. Firestore Rules chỉ cho tài khoản có custom claim Admin đọc/ghi/xóa `GiangVien`, kiểm tra đúng schema bốn trường và từ chối mọi collection khác.

## Cài đặt

```powershell
git clone https://github.com/CrissNguyenKhanh/Product-Management-App.git
cd Product-Management-App
git switch original-rebuild
npm install
Copy-Item .env.example .env
```

## Deploy Firestore Rules

```powershell
npx firebase-tools login
npx firebase-tools use product-management-app-239fa
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Lệnh trên không deploy Cloud Functions hoặc Firebase Storage.

## Chạy Web

```powershell
npm run web
```

Trình duyệt sẽ mở giao diện Admin. Đăng nhập bằng tài khoản Firebase Authentication đã có claim `admin: true`.

## Chạy trên iPhone

```powershell
npx expo start --clear
```

Mở Expo Go trên iPhone và quét QR. Nếu LAN chặn kết nối:

```powershell
npx expo start --tunnel --clear
```

Khi chọn ảnh, app crop 1:1, resize/nén thành JPEG rồi lưu data URI vào trường `Image`. Nếu ảnh vẫn vượt 180.000 ký tự, app yêu cầu chọn ảnh khác.

## Kiểm tra source

```powershell
npm install
npx expo install --check
npx tsc --noEmit
npm run lint
```

## Kịch bản demo

1. Đăng nhập Admin.
2. Xem tổng giảng viên và tổng số lớp trên Dashboard.
3. Thêm giảng viên với đủ `IDGV`, `Fullname`, `Image`, `SumClass`.
4. Tìm kiếm theo mã hoặc họ tên.
5. Xem chi tiết và sửa thông tin.
6. Chọn/thay ảnh trên iPhone và mở lại app để kiểm tra ảnh vẫn hiển thị.
7. Hủy xóa, sau đó xác nhận xóa.
8. Đăng xuất.

Dữ liệu JSON mẫu nằm tại [docs/GiangVien.sample.json](docs/GiangVien.sample.json). Xem thêm [báo cáo giữa kỳ](docs/BAO_CAO_GIUA_KY.md) và [hướng dẫn chụp ảnh](docs/HUONG_DAN_CHUP_ANH_IPHONE.md).
