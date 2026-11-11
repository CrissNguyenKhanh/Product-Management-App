import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import {
  CreateManagedUserInput,
  MAX_IMAGE_DATA_URI_LENGTH,
  ManagedUser,
  PASSWORD_PLACEHOLDER,
  UserDocument,
  UpdateManagedUserInput,
} from '@/models/user';

const JPEG_DATA_URI_PATTERN = /^data:image\/jpeg;base64,[A-Za-z0-9+/]*={0,2}$/;

function fromSnapshot(id: string, data: Record<string, unknown>): ManagedUser {
  return {
    id,
    username: typeof data.username === 'string' ? data.username : '',
    email: typeof data.email === 'string' ? data.email : '',
    password: PASSWORD_PLACEHOLDER,
    image: typeof data.image === 'string' ? data.image : '',
  };
}

function sortUsers(users: ManagedUser[]): ManagedUser[] {
  return users.sort((a, b) => a.username.localeCompare(b.username, 'vi'));
}

function toDocument(input: CreateManagedUserInput): UserDocument {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const image = input.image.trim();

  if (image.length > MAX_IMAGE_DATA_URI_LENGTH) {
    throw new Error('Ảnh vượt quá giới hạn 180.000 ký tự. Vui lòng chọn ảnh khác.');
  }
  if (image && !JPEG_DATA_URI_PATTERN.test(image)) {
    throw new Error('Ảnh phải là JPEG data URI do ứng dụng tạo. Vui lòng chọn lại ảnh.');
  }

  return {
    username,
    email,
    password: PASSWORD_PLACEHOLDER,
    image,
  };
}

export function subscribeToUsers(
  onData: (users: ManagedUser[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const users = snapshot.docs.map((item) => fromSnapshot(item.id, item.data()));
      onData(sortUsers(users));
    },
    (error) => onError(error),
  );
}

export async function fetchUsers(): Promise<ManagedUser[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  return sortUsers(snapshot.docs.map((item) => fromSnapshot(item.id, item.data())));
}

export async function fetchUser(uid: string): Promise<ManagedUser | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? fromSnapshot(snapshot.id, snapshot.data()) : null;
}

export async function createManagedUser(input: CreateManagedUserInput): Promise<string> {
  const reference = await addDoc(collection(db, 'users'), toDocument(input));
  return reference.id;
}

export async function updateManagedUser(input: UpdateManagedUserInput): Promise<void> {
  await updateDoc(
    doc(db, 'users', input.uid),
    toDocument({ username: input.username, email: input.email, image: input.image }),
  );
}

export async function deleteManagedUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}
