export const PASSWORD_PLACEHOLDER = '[demo-no-login]';
export const MAX_IMAGE_DATA_URI_LENGTH = 180_000;

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
  image: string;
};

export type UpdateManagedUserInput = {
  uid: string;
  username: string;
  email: string;
  image: string;
};
