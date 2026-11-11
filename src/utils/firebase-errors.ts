import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
  'auth/invalid-email': 'Email không đúng định dạng.',
  'auth/network-request-failed': 'Không thể kết nối Firebase. Hãy kiểm tra mạng.',
  'auth/too-many-requests': 'Có quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
  'permission-denied': 'Tài khoản hiện tại không có quyền Admin để truy cập dữ liệu.',
  unavailable: 'Firestore đang tạm thời không khả dụng. Hãy kiểm tra kết nối mạng.',
  'resource-exhausted': 'Đã vượt quota Firestore miễn phí. Vui lòng thử lại sau.',
  'failed-precondition': 'Firestore chưa được cấu hình đúng hoặc thao tác chưa đáp ứng điều kiện.',
  'not-found': 'Không tìm thấy hồ sơ người dùng.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return messages[error.code] ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}
