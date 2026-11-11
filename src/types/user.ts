export const MANAGED_PASSWORD_VALUE = '[managed-by-firebase-auth]' as const;

export type UserDocument = {
  username: string;
  email: string;
  password: typeof MANAGED_PASSWORD_VALUE;
  image: string;
};

export type ManagedUser = UserDocument & {
  uid: string;
};

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
};

export type UpdateUserInput = {
  uid: string;
  username: string;
  email: string;
  image: string;
  password?: string;
};
