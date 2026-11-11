import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger, setGlobalOptions } from 'firebase-functions/v2';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

if (getApps().length === 0) initializeApp();

setGlobalOptions({ maxInstances: 10, region: 'asia-southeast1' });

const auth = getAuth();
const firestore = getFirestore();
const MANAGED_PASSWORD = '[managed-by-firebase-auth]';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthContext = CallableRequest<unknown>['auth'];

function assertAdmin(context: AuthContext): asserts context is NonNullable<AuthContext> {
  if (!context) {
    throw new HttpsError('unauthenticated', 'Bạn cần đăng nhập để thực hiện thao tác này.');
  }
  if (context.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Tài khoản không có quyền Admin.');
  }
}

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpsError('invalid-argument', `${field} không được để trống.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new HttpsError('invalid-argument', `${field} vượt quá ${maxLength} ký tự.`);
  }
  return normalized;
}

function validateEmail(value: unknown): string {
  const email = requiredString(value, 'Email', 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpsError('invalid-argument', 'Email không hợp lệ.');
  }
  return email;
}

function validatePassword(value: unknown, optional = false): string | undefined {
  if (optional && (value === undefined || value === '')) return undefined;
  if (typeof value !== 'string' || value.length < 6 || value.length > 4096) {
    throw new HttpsError('invalid-argument', 'Mật khẩu phải có từ 6 đến 4096 ký tự.');
  }
  return value;
}

function validateImage(value: unknown): string {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string' || value.length > 4096 || !value.startsWith('https://')) {
    throw new HttpsError('invalid-argument', 'URL ảnh không hợp lệ.');
  }
  return value;
}

function throwKnownError(error: unknown): never {
  if (error instanceof HttpsError) throw error;
  const code = (error as { code?: string }).code;
  if (code === 'auth/email-already-exists') {
    throw new HttpsError('already-exists', 'Email đã được sử dụng.');
  }
  if (code === 'auth/user-not-found') {
    throw new HttpsError('not-found', 'Không tìm thấy tài khoản Firebase Authentication.');
  }
  if (code === 'auth/invalid-email' || code === 'auth/invalid-password') {
    throw new HttpsError('invalid-argument', 'Email hoặc mật khẩu không hợp lệ.');
  }
  logger.error('Managed user operation failed', error);
  throw new HttpsError('internal', 'Không thể hoàn thành thao tác quản lý người dùng.');
}

export const createManagedUser = onCall(async (request) => {
  assertAdmin(request.auth);
  const data = request.data as Record<string, unknown>;
  const username = requiredString(data.username, 'Username', 80);
  const email = validateEmail(data.email);
  const password = validatePassword(data.password);

  let uid = '';
  try {
    const authUser = await auth.createUser({
      displayName: username,
      email,
      emailVerified: false,
      password,
    });
    uid = authUser.uid;

    await firestore.collection('users').doc(uid).set({
      username,
      email,
      password: MANAGED_PASSWORD,
      image: '',
    });

    return { uid };
  } catch (error) {
    if (uid) {
      try {
        await auth.deleteUser(uid);
      } catch (rollbackError) {
        logger.error('Could not roll back Auth user after Firestore failure', rollbackError);
      }
    }
    throwKnownError(error);
  }
});

export const updateManagedUser = onCall(async (request) => {
  assertAdmin(request.auth);
  const data = request.data as Record<string, unknown>;
  const uid = requiredString(data.uid, 'UID', 128);
  const username = requiredString(data.username, 'Username', 80);
  const email = validateEmail(data.email);
  const password = validatePassword(data.password, true);
  const image = validateImage(data.image);

  try {
    await auth.updateUser(uid, {
      displayName: username,
      email,
      ...(password ? { password } : {}),
    });

    await firestore.collection('users').doc(uid).set({
      username,
      email,
      password: MANAGED_PASSWORD,
      image,
    });

    return { success: true as const };
  } catch (error) {
    throwKnownError(error);
  }
});

export const deleteManagedUser = onCall(async (request) => {
  assertAdmin(request.auth);
  const data = request.data as Record<string, unknown>;
  const uid = requiredString(data.uid, 'UID', 128);

  if (uid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'Admin không thể tự xóa tài khoản đang đăng nhập.');
  }

  try {
    await getStorage().bucket().deleteFiles({ prefix: `avatars/${uid}/` });
    await firestore.collection('users').doc(uid).delete();
    try {
      await auth.deleteUser(uid);
    } catch (error) {
      if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
    }
    return { success: true as const };
  } catch (error) {
    throwKnownError(error);
  }
});
