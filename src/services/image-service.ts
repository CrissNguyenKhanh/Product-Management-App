import * as ImagePicker from 'expo-image-picker';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '@/config/firebase';

export async function pickAvatar(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Ứng dụng cần quyền truy cập thư viện ảnh để chọn avatar.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
    selectionLimit: 1,
  });

  return result.canceled ? null : result.assets[0]?.uri ?? null;
}

function extensionForUri(uri: string): string {
  const cleanUri = uri.split('?')[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
}

export async function uploadAvatar(uid: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Không thể đọc ảnh đã chọn.');

  const blob = await response.blob();
  if (blob.size > 5 * 1024 * 1024) {
    throw new Error('Ảnh phải nhỏ hơn 5 MB.');
  }

  const objectRef = ref(storage, `users/${uid}/avatar-${Date.now()}.${extensionForUri(uri)}`);
  await uploadBytes(objectRef, blob, { contentType: blob.type || 'image/jpeg' });
  return getDownloadURL(objectRef);
}

export async function removeAvatar(downloadUrl: string): Promise<void> {
  if (!downloadUrl) return;
  try {
    await deleteObject(ref(storage, downloadUrl));
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('object-not-found')) throw error;
  }
}
