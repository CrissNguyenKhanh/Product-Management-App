const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/email-already-in-use': 'Email này đã được sử dụng.',
  'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'auth/network-request-failed': 'Không thể kết nối mạng. Vui lòng thử lại.',
  'auth/too-many-requests': 'Có quá nhiều lần thử. Vui lòng chờ rồi thử lại.',
  'functions/already-exists': 'Email này đã được sử dụng.',
  'functions/permission-denied': 'Bạn không có quyền Admin để thực hiện thao tác này.',
  'functions/unauthenticated': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'functions/invalid-argument': 'Dữ liệu gửi lên không hợp lệ.',
  'functions/failed-precondition': 'Không thể thực hiện thao tác trong trạng thái hiện tại.',
  'functions/not-found': 'Không tìm thấy tài khoản người dùng.',
  'functions/internal': 'Backend không thể hoàn thành thao tác. Vui lòng thử lại.',
  'functions/unavailable': 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại.',
  'firestore/permission-denied': 'Bạn không có quyền đọc dữ liệu người dùng.',
  'firestore/unavailable': 'Không thể kết nối Firestore. Vui lòng kiểm tra mạng.',
  'storage/unauthorized': 'Bạn không có quyền truy cập ảnh.',
  'storage/retry-limit-exceeded': 'Tải ảnh thất bại do kết nối không ổn định.',
};

type ErrorWithCode = Error & { code?: string };

export function getErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (error instanceof Error) {
    const codedError = error as ErrorWithCode;
    if (codedError.code && ERROR_MESSAGES[codedError.code]) {
      return ERROR_MESSAGES[codedError.code];
    }

    return error.message || fallback;
  }

  return fallback;
}
