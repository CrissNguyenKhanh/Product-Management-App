export const MAX_IMAGE_DATA_URI_LENGTH = 180_000;

export type Lecturer = {
  id: string;
  IDGV: string;
  Fullname: string;
  Image: string;
  SumClass: number;
};

export type LecturerDocument = Omit<Lecturer, 'id'>;

export type CreateLecturerInput = LecturerDocument;

export type UpdateLecturerInput = LecturerDocument & {
  documentId: string;
};
