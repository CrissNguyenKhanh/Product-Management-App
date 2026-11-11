import { deleteObject, getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '../config/firebase';

const avatarPath = (uid: string) => `avatars/${uid}/profile.jpg`;

export async function uploadAvatar(uid: string, dataUrl: string): Promise<string> {
  const avatarRef = ref(storage, avatarPath(uid));
  await uploadString(avatarRef, dataUrl, 'data_url', { contentType: 'image/jpeg' });
  return getDownloadURL(avatarRef);
}

export async function removeAvatar(uid: string): Promise<void> {
  try {
    await deleteObject(ref(storage, avatarPath(uid)));
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
