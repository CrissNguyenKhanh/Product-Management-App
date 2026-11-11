# Hướng dẫn chụp ảnh minh họa trên iPhone

Chỉ chụp sau khi Functions/rules đã deploy và các thao tác thực tế thành công. Không dùng ảnh mock để thay cho kết quả Firebase.

## Chuẩn bị

1. Mở Expo Go tương thích SDK 58 trên iPhone.
2. Tăng độ sáng vừa phải và tắt thông báo cá nhân khi quay/chụp.
3. Dùng một Admin test và một user test không chứa dữ liệu nhạy cảm.
4. Không để password thật xuất hiện trong ảnh hoặc video.
5. Lưu ảnh theo tên gợi ý bên dưới để dễ đưa vào báo cáo.

## Danh sách ảnh cần chụp

| STT | Tên file gợi ý | Nội dung cần thể hiện |
|---|---|---|
| 01 | `01-login.png` | Màn hình đăng nhập đầy đủ |
| 02 | `02-login-error.png` | Thông báo khi đăng nhập sai |
| 03 | `03-dashboard.png` | Email Admin và tổng người dùng |
| 04 | `04-user-list.png` | Danh sách lấy từ Firestore |
| 05 | `05-search.png` | Kết quả tìm username/email |
| 06 | `06-add-form.png` | Form đúng 4 trường |
| 07 | `07-image-picker.png` | Thư viện ảnh iPhone đang mở |
| 08 | `08-image-preview.png` | Preview ảnh đã chọn |
| 09 | `09-add-success.png` | Thông báo thêm thành công |
| 10 | `10-user-detail.png` | Avatar lớn, username, email, password che |
| 11 | `11-edit-user.png` | Form sửa và ô mật khẩu mới |
| 12 | `12-delete-confirm.png` | Hộp thoại Hủy/Xóa |
| 13 | `13-empty-state.png` | Empty state (nếu có môi trường test riêng) |
| 14 | `14-firestore.png` | Firebase Console với đúng 4 field |
| 15 | `15-auth.png` | Firebase Auth user, che thông tin nhạy cảm |
| 16 | `16-storage.png` | File `avatars/{uid}/profile.jpg` |

## Cách chụp từng bước

1. Tại Login, chụp giao diện trước khi nhập.
2. Nhập credential sai không nhạy cảm, nhấn Đăng nhập và chụp error state.
3. Đăng nhập Admin, chụp Dashboard sau khi số liệu tải xong.
4. Mở danh sách và kéo xuống để thể hiện pull-to-refresh trong video.
5. Nhập từ khóa tìm kiếm và chụp kết quả lọc.
6. Mở form thêm, chụp trước và sau khi chọn ảnh.
7. Hoàn tất tạo user, chụp thông báo thành công và card mới trong danh sách.
8. Mở chi tiết để chứng minh password chỉ là `********`.
9. Mở Edit, đổi username/email/password/ảnh rồi lưu.
10. Nhấn Delete, chụp hộp thoại; chọn Hủy lần đầu để chứng minh cancel.
11. Mở lại hộp thoại, xác nhận xóa và quay sự thay đổi danh sách.
12. Chụp Firebase Console để đối chiếu Auth, bốn field Firestore và Storage.

## Chèn ảnh vào báo cáo

Tạo thư mục `docs/images/` sau khi có ảnh thật, rồi chèn:

```markdown
![Màn hình đăng nhập](images/01-login.png)
```

Thêm chú thích ngắn nêu thao tác, dữ liệu đầu vào và kết quả quan sát được. Không ghi “đạt” nếu ảnh hoặc video không chứng minh được kết quả.
