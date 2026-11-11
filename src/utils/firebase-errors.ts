import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
  'auth/invalid-email': 'Email không đúng định dạng.',
  'auth/network-request-failed': 'Không thể kết nối Firebase. Hãy kiểm tra mạng.',
  'auth/too-many-requests': 'Có quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
  'functions/already-exists': 'Email này đã được sử dụng.',
  'functions/invalid-argument': 'Dữ liệu gửi lên không hợp lệ.',
  'functions/permission-denied': 'Tài khoản không có quyền Admin.',
  'functions/unauthenticated': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'functions/unavailable': 'Dịch vụ đang tạm thời không khả dụng.',
  'functions/not-found': 'Không tìm thấy người dùng.',
  'permission-denied': 'Bạn không có quyền truy cập dữ liệu này.',
  'storage/unauthorized': 'Bạn không có quyền truy cập ảnh.',
  'storage/retry-limit-exceeded': 'Tải ảnh thất bại do kết nối không ổn định.',
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
