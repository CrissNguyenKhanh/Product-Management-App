# Hướng dẫn chụp ảnh minh họa trên iPhone

Chỉ bổ sung ảnh thật sau khi app đã kết nối Firebase và chạy bằng Expo Go. Không dùng ảnh mock để mô tả kết quả kiểm thử.

## Chuẩn bị

1. Deploy Firestore Rules và indexes; không cần Functions hoặc Storage.
2. Xác nhận tài khoản Admin hiện có đã có custom claim `admin: true`.
3. Chạy `npx expo start --clear` trên máy tính.
4. Mở project bằng Expo Go tương thích SDK 58 trên iPhone.
5. Dùng email hồ sơ demo, không nhập mật khẩu thật vào dữ liệu bài thi.

## Danh sách ảnh cần chụp

1. `01-login.png`: màn hình Login Admin trước khi nhập.
2. `02-login-error.png`: email/mật khẩu Admin sai và thông báo lỗi.
3. `03-dashboard.png`: Dashboard có email Admin và tổng hồ sơ.
4. `04-user-list-empty.png`: empty state nếu collection trống.
5. `05-add-user.png`: form username, email, password demo và image.
6. `06-image-picker.png`: giao diện chọn ảnh iOS.
7. `07-user-list.png`: danh sách sau khi thêm hồ sơ.
8. `08-search.png`: kết quả tìm kiếm username/email.
9. `09-user-detail.png`: avatar và bốn trường demo.
10. `10-edit-user.png`: form sửa hồ sơ, không có đổi mật khẩu Auth.
11. `11-delete-confirm.png`: hộp thoại nói rõ chỉ xóa document Firestore.
12. `12-reopen-image.png`: ảnh vẫn hiển thị sau khi đóng/mở app.
13. `13-logout.png`: quay về Login sau đăng xuất.

## Cách chụp

- iPhone Face ID: bấm đồng thời nút sườn và nút tăng âm lượng.
- Không cắt mất Dynamic Island, tiêu đề hoặc thanh điều hướng.
- Che email Admin thật trước khi đưa vào báo cáo.
- Không chụp mật khẩu Admin đang hiển thị rõ.
- Dùng cùng một bộ dữ liệu demo để ảnh có trình tự dễ hiểu.

## Đưa ảnh vào báo cáo

Tạo `docs/images/`, đặt tên đúng danh sách trên và chèn bằng Markdown, ví dụ:

```markdown
![Dashboard trên iPhone](images/03-dashboard.png)
```

Sau khi quay video, thay placeholder trong README và báo cáo bằng URL thật.
