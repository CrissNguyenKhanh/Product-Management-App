import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import {
  CreateUserInput,
  ManagedUser,
  MANAGED_PASSWORD_VALUE,
  UpdateUserInput,
} from '../types/user';

const usersCollection = collection(db, 'users');

type CreateUserResult = { uid: string };
type MutationResult = { success: true };

const createUserCallable = httpsCallable<CreateUserInput, CreateUserResult>(
  functions,
  'createManagedUser',
);
const updateUserCallable = httpsCallable<UpdateUserInput, MutationResult>(
  functions,
  'updateManagedUser',
);
const deleteUserCallable = httpsCallable<{ uid: string }, MutationResult>(
  functions,
  'deleteManagedUser',
);

function toManagedUser(uid: string, value: Record<string, unknown>): ManagedUser {
  return {
    uid,
    username: typeof value.username === 'string' ? value.username : '',
    email: typeof value.email === 'string' ? value.email : '',
    password: MANAGED_PASSWORD_VALUE,
    image: typeof value.image === 'string' ? value.image : '',
  };
}

export async function listUsers(): Promise<ManagedUser[]> {
  const snapshot = await getDocs(query(usersCollection));
  return snapshot.docs
    .map((item) => toManagedUser(item.id, item.data()))
    .sort((a, b) => a.username.localeCompare(b.username, 'vi'));
}

export function subscribeToUsers(
  onData: (users: ManagedUser[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(usersCollection),
    (snapshot) => {
      const users = snapshot.docs
        .map((item) => toManagedUser(item.id, item.data()))
        .sort((a, b) => a.username.localeCompare(b.username, 'vi'));
      onData(users);
    },
    onError,
  );
}

export async function getUser(uid: string): Promise<ManagedUser | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? toManagedUser(snapshot.id, snapshot.data()) : null;
}

export async function createUser(input: CreateUserInput): Promise<string> {
  const result = await createUserCallable(input);
  return result.data.uid;
}

export async function updateUser(input: UpdateUserInput): Promise<void> {
  await updateUserCallable(input);
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteUserCallable({ uid });
}
