import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import {
  CreateLecturerInput,
  Lecturer,
  LecturerDocument,
  MAX_IMAGE_DATA_URI_LENGTH,
  UpdateLecturerInput,
} from '@/models/lecturer';

const COLLECTION_NAME = 'GiangVien';
const JPEG_DATA_URI_PATTERN = /^data:image\/jpeg;base64,[A-Za-z0-9+/]*={0,2}$/;

function fromSnapshot(id: string, data: Record<string, unknown>): Lecturer {
  return {
    id,
    IDGV: typeof data.IDGV === 'string' ? data.IDGV : '',
    Fullname: typeof data.Fullname === 'string' ? data.Fullname : '',
    Image: typeof data.Image === 'string' ? data.Image : '',
    SumClass:
      typeof data.SumClass === 'number' && Number.isInteger(data.SumClass) ? data.SumClass : 0,
  };
}

function sortLecturers(lecturers: Lecturer[]): Lecturer[] {
  return lecturers.sort((a, b) => a.IDGV.localeCompare(b.IDGV, 'vi'));
}

function toDocument(input: CreateLecturerInput): LecturerDocument {
  const IDGV = input.IDGV.trim().toUpperCase();
  const Fullname = input.Fullname.trim();
  const Image = input.Image.trim();
  const SumClass = input.SumClass;

  if (Image.length > MAX_IMAGE_DATA_URI_LENGTH) {
    throw new Error('Ảnh vượt quá giới hạn 180.000 ký tự. Vui lòng chọn ảnh khác.');
  }
  if (Image && !JPEG_DATA_URI_PATTERN.test(Image)) {
    throw new Error('Ảnh phải là JPEG data URI do ứng dụng tạo. Vui lòng chọn lại ảnh.');
  }
  if (!Number.isInteger(SumClass) || SumClass < 0 || SumClass > 10_000) {
    throw new Error('Tổng số lớp phải là số nguyên từ 0 đến 10.000.');
  }

  return { IDGV, Fullname, Image, SumClass };
}

async function ensureUniqueIDGV(IDGV: string, exceptDocumentId?: string): Promise<void> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), where('IDGV', '==', IDGV)),
  );
  const duplicated = snapshot.docs.some((item) => item.id !== exceptDocumentId);
  if (duplicated) throw new Error(`Mã giảng viên ${IDGV} đã tồn tại.`);
}

export function subscribeToLecturers(
  onData: (lecturers: Lecturer[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const lecturers = snapshot.docs.map((item) => fromSnapshot(item.id, item.data()));
      onData(sortLecturers(lecturers));
    },
    onError,
  );
}

export async function fetchLecturers(): Promise<Lecturer[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return sortLecturers(snapshot.docs.map((item) => fromSnapshot(item.id, item.data())));
}

export async function fetchLecturer(documentId: string): Promise<Lecturer | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, documentId));
  return snapshot.exists() ? fromSnapshot(snapshot.id, snapshot.data()) : null;
}

export async function createLecturer(input: CreateLecturerInput): Promise<string> {
  const data = toDocument(input);
  await ensureUniqueIDGV(data.IDGV);
  const reference = await addDoc(collection(db, COLLECTION_NAME), data);
  return reference.id;
}

export async function updateLecturer(input: UpdateLecturerInput): Promise<void> {
  const data = toDocument(input);
  await ensureUniqueIDGV(data.IDGV, input.documentId);
  await updateDoc(doc(db, COLLECTION_NAME, input.documentId), data);
}

export async function deleteLecturer(documentId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, documentId));
}
