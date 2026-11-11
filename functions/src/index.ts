import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { setGlobalOptions } from 'firebase-functions/v2';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

if (getApps().length === 0) initializeApp();

setGlobalOptions({
  region: 'asia-southeast1',
  maxInstances: 10,
});

const auth = getAuth();
const db = getFirestore();
const PASSWORD_PLACEHOLDER = '[managed-by-firebase-auth]';

type CreateUserInput = {
  username?: unknown;
  email?: unknown;
  password?: unknown;
  image?: unknown;
};

type UpdateUserInput = {
  uid?: unknown;
  username?: unknown;
  email?: unknown;
  image?: unknown;
  newPassword?: unknown;
};

function assertAdmin(request: CallableRequest<unknown>): void {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Bạn cần đăng nhập lại.');
  }
  if (request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Tài khoản không có quyền Admin.');
  }
}

function requireObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpsError('invalid-argument', 'Dữ liệu gửi lên không hợp lệ.');
  }
  return value as Record<string, unknown>;
}

function requireString(
  value: unknown,
  field: string,
  options: { min?: number; max?: number; allowEmpty?: boolean } = {},
): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} phải là chuỗi.`);
  }

  const normalized = field === 'password' || field === 'newPassword' ? value : value.trim();
  if (!options.allowEmpty && !normalized) {
    throw new HttpsError('invalid-argument', `${field} không được để trống.`);
  }
  if (options.min && normalized.length < options.min) {
    throw new HttpsError('invalid-argument', `${field} phải có ít nhất ${options.min} ký tự.`);
  }
  if (options.max && normalized.length > options.max) {
    throw new HttpsError('invalid-argument', `${field} không được vượt quá ${options.max} ký tự.`);
  }
  return normalized;
}

function normalizeEmail(value: unknown): string {
  const email = requireString(value, 'email', { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Email không đúng định dạng.');
  }
  return email;
}

function mapAdminError(error: unknown): never {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'auth/email-already-exists') {
    throw new HttpsError('already-exists', 'Email này đã được sử dụng.');
  }
  if (code === 'auth/user-not-found') {
    throw new HttpsError('not-found', 'Không tìm thấy tài khoản người dùng.');
  }
  if (code === 'auth/invalid-password' || code === 'auth/invalid-email') {
    throw new HttpsError('invalid-argument', 'Email hoặc mật khẩu không hợp lệ.');
  }

  logger.error('Firebase Admin operation failed', error);
  throw new HttpsError('internal', 'Không thể hoàn tất thao tác trên Firebase.');
}

export const createManagedUser = onCall(async (request) => {
  assertAdmin(request);
  const data = requireObject(request.data) as CreateUserInput;
  const username = requireString(data.username, 'username', { min: 2, max: 50 });
  const email = normalizeEmail(data.email);
  const password = requireString(data.password, 'password', { min: 6, max: 128 });
  const image = requireString(data.image ?? '', 'image', { allowEmpty: true, max: 2048 });

  let uid = '';
  try {
    const record = await auth.createUser({ email, password, displayName: username });
    uid = record.uid;
    await db.collection('users').doc(uid).set({
      username,
      email,
      password: PASSWORD_PLACEHOLDER,
      image,
    });
    return { uid };
  } catch (error) {
    if (uid) {
      await auth.deleteUser(uid).catch((rollbackError) => {
        logger.error('Could not roll back Auth user after Firestore failure', rollbackError);
      });
    }
    return mapAdminError(error);
  }
});

export const updateManagedUser = onCall(async (request) => {
  assertAdmin(request);
  const data = requireObject(request.data) as UpdateUserInput;
  const uid = requireString(data.uid, 'uid', { max: 128 });
  const username = requireString(data.username, 'username', { min: 2, max: 50 });
  const email = normalizeEmail(data.email);
  const image = requireString(data.image ?? '', 'image', { allowEmpty: true, max: 2048 });
  const newPassword =
    data.newPassword === undefined || data.newPassword === ''
      ? undefined
      : requireString(data.newPassword, 'newPassword', { min: 6, max: 128 });

  try {
    await auth.updateUser(uid, {
      email,
      displayName: username,
      ...(newPassword ? { password: newPassword } : {}),
    });
    await db.collection('users').doc(uid).set({
      username,
      email,
      password: PASSWORD_PLACEHOLDER,
      image,
    });
    return { ok: true as const };
  } catch (error) {
    return mapAdminError(error);
  }
});

export const deleteManagedUser = onCall(async (request) => {
  assertAdmin(request);
  const data = requireObject(request.data);
  const uid = requireString(data.uid, 'uid', { max: 128 });

  try {
    const [files] = await getStorage().bucket().getFiles({ prefix: `users/${uid}/` });
    await Promise.all(files.map((file) => file.delete({ ignoreNotFound: true })));
  } catch (storageError) {
    logger.warn(`Could not remove every Storage object for user ${uid}`, storageError);
  }

  try {
    await auth.deleteUser(uid).catch((error: unknown) => {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code !== 'auth/user-not-found') throw error;
    });
    await db.collection('users').doc(uid).delete();
    return { ok: true as const };
  } catch (error) {
    return mapAdminError(error);
  }
});
