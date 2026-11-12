# Hướng dẫn chụp ảnh minh họa

## Chuẩn bị

1. Deploy `firestore.rules` và `firestore.indexes.json`.
2. Xác nhận Admin có custom claim `admin: true`.
3. Chạy Web bằng `npm run web` và mobile bằng `npx expo start --clear`.
4. Dùng dữ liệu giảng viên demo, không đưa thông tin nhạy cảm vào báo cáo.

## Danh sách ảnh nên chụp

1. `01-login-web.png`: màn hình đăng nhập Admin trên Web.
2. `02-dashboard-web.png`: tổng giảng viên và tổng số lớp.
3. `03-list-web.png`: danh sách giảng viên.
4. `04-add-web.png`: form đủ IDGV, Fullname, Image, SumClass.
5. `05-search-web.png`: kết quả tìm theo IDGV hoặc họ tên.
6. `06-detail-web.png`: chi tiết đủ bốn trường.
7. `07-edit-web.png`: sửa giảng viên.
8. `08-delete-confirm.png`: hộp thoại xác nhận xóa.
9. `09-firestore-console.png`: collection `GiangVien` và document đúng bốn trường.
10. `10-image-picker-iphone.png`: giao diện chọn ảnh iOS.
11. `11-image-iphone.png`: ảnh giảng viên hiển thị trong app mobile.

## Lưu ý

- Không cắt mất tiêu đề, thanh điều hướng hoặc tên trường.
- Firestore Console phải nhìn rõ đúng `IDGV`, `Fullname`, `Image`, `SumClass`.
- Chỉ chụp collection `GiangVien` của đề hiện tại.
- Che email Admin thật nếu cần.
- Dùng cùng một bộ dữ liệu demo cho ảnh và video.
