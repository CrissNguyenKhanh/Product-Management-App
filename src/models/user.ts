export const PASSWORD_PLACEHOLDER = '[managed-by-firebase-auth]';

export type ManagedUser = {
  id: string;
  username: string;
  email: string;
  password: typeof PASSWORD_PLACEHOLDER;
  image: string;
};

export type UserDocument = Omit<ManagedUser, 'id'>;

export type CreateManagedUserInput = {
  username: string;
  email: string;
  password: string;
  image: string;
};

export type UpdateManagedUserInput = {
  uid: string;
  username: string;
  email: string;
  image: string;
  newPassword?: string;
};
