const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const normalized = email.trim();
  if (!normalized) return 'Vui lòng nhập email.';
  if (normalized.length > 254) return 'Email không được vượt quá 254 ký tự.';
  if (!EMAIL_PATTERN.test(normalized)) return 'Email không đúng định dạng.';
  return null;
}

const LECTURER_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function validateLecturerId(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return 'Vui lòng nhập mã giảng viên.';
  if (normalized.length < 2 || normalized.length > 20) {
    return 'Mã giảng viên phải có từ 2 đến 20 ký tự.';
  }
  if (!LECTURER_ID_PATTERN.test(normalized)) {
    return 'Mã giảng viên chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.';
  }
  return null;
}

export function validateFullname(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return 'Vui lòng nhập họ và tên giảng viên.';
  if (normalized.length < 2) return 'Họ và tên phải có ít nhất 2 ký tự.';
  if (normalized.length > 100) return 'Họ và tên không được vượt quá 100 ký tự.';
  return null;
}

export function validateSumClass(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return 'Vui lòng nhập tổng số lớp.';
  if (!/^\d+$/.test(normalized)) return 'Tổng số lớp phải là số nguyên không âm.';
  const number = Number(normalized);
  if (!Number.isSafeInteger(number) || number > 10_000) {
    return 'Tổng số lớp phải từ 0 đến 10.000.';
  }
  return null;
}
