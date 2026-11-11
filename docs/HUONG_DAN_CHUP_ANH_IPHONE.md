# Hướng dẫn chụp ảnh minh họa trên iPhone

Chỉ bổ sung ảnh thật sau khi app đã kết nối Firebase và chạy bằng Expo Go. Không dùng ảnh mock để mô tả kết quả kiểm thử.

## Chuẩn bị

1. Deploy Cloud Functions, Firestore Rules và Storage Rules.
2. Tạo Admin đầu tiên và đăng nhập thử.
3. Chạy `npx expo start --clear` trên máy tính.
4. Mở project bằng Expo Go SDK 58 trên iPhone.
5. Xóa dữ liệu test nhạy cảm; dùng email demo riêng.

## Danh sách ảnh cần chụp

1. `01-login.png`: màn hình Login trước khi nhập.
2. `02-login-error.png`: email/mật khẩu sai và thông báo lỗi.
3. `03-dashboard.png`: Dashboard có email Admin và tổng người dùng.
4. `04-user-list-empty.png`: empty state nếu collection trống.
5. `05-add-user.png`: form đủ username, email, password, image.
6. `06-image-picker.png`: giao diện chọn ảnh của iOS.
7. `07-user-list.png`: danh sách sau khi thêm thành công.
8. `08-search.png`: kết quả tìm kiếm username/email.
9. `09-user-detail.png`: avatar lớn và bốn thông tin theo đề.
10. `10-edit-user.png`: form sửa và ô mật khẩu mới tùy chọn.
11. `11-delete-confirm.png`: hộp thoại Cancel/Delete.
12. `12-logout.png`: trạng thái quay về Login sau đăng xuất.

## Cách chụp

- iPhone Face ID: bấm đồng thời nút sườn và nút tăng âm lượng.
- Không cắt mất Dynamic Island, tiêu đề hoặc thanh điều hướng.
- Che email thật và thông tin nhạy cảm trước khi đưa vào báo cáo.
- Không chụp password đang hiển thị rõ.
- Dùng cùng một bộ dữ liệu demo để ảnh có trình tự dễ hiểu.

## Đưa ảnh vào báo cáo

Tạo `docs/images/`, đặt tên đúng danh sách trên và chèn bằng Markdown, ví dụ:

```markdown
![Dashboard trên iPhone](images/03-dashboard.png)
```

Sau khi quay video, thay placeholder trong README và báo cáo bằng URL thật.
