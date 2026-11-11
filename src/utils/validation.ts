const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const normalized = email.trim();
  if (!normalized) return 'Vui lòng nhập email.';
  if (!EMAIL_PATTERN.test(normalized)) return 'Email không đúng định dạng.';
  return null;
}

export function validateUsername(username: string): string | null {
  const normalized = username.trim();
  if (!normalized) return 'Vui lòng nhập username.';
  if (normalized.length < 2) return 'Username phải có ít nhất 2 ký tự.';
  if (normalized.length > 50) return 'Username không được vượt quá 50 ký tự.';
  return null;
}

export function validatePassword(password: string, required: boolean): string | null {
  if (!password && !required) return null;
  if (!password) return 'Vui lòng nhập mật khẩu.';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
  if (password.length > 128) return 'Mật khẩu không được vượt quá 128 ký tự.';
  return null;
}
