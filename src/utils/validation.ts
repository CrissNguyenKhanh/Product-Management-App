const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const normalized = email.trim();
  if (!normalized) return 'Vui lòng nhập email.';
  if (normalized.length > 254) return 'Email không được vượt quá 254 ký tự.';
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
