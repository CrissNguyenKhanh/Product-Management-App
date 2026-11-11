import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { db, functions } from '@/config/firebase';
import {
  CreateManagedUserInput,
  ManagedUser,
  PASSWORD_PLACEHOLDER,
  UpdateManagedUserInput,
} from '@/models/user';

type CreateUserResult = { uid: string };
type OperationResult = { ok: true };

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
  const callable = httpsCallable<CreateManagedUserInput, CreateUserResult>(
    functions,
    'createManagedUser',
  );
  const result = await callable(input);
  return result.data.uid;
}

export async function updateManagedUser(input: UpdateManagedUserInput): Promise<void> {
  const callable = httpsCallable<UpdateManagedUserInput, OperationResult>(
    functions,
    'updateManagedUser',
  );
  await callable(input);
}

export async function deleteManagedUser(uid: string): Promise<void> {
  const callable = httpsCallable<{ uid: string }, OperationResult>(
    functions,
    'deleteManagedUser',
  );
  await callable({ uid });
}
