import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { MAX_IMAGE_DATA_URI_LENGTH } from '@/models/user';

const JPEG_PREFIX = 'data:image/jpeg;base64,';

const COMPRESSION_ATTEMPTS = [
  { width: 512, compress: 0.55 },
  { width: 448, compress: 0.5 },
  { width: 384, compress: 0.45 },
  { width: 320, compress: 0.4 },
  { width: 256, compress: 0.35 },
  { width: 224, compress: 0.3 },
  { width: 192, compress: 0.25 },
] as const;

async function createJpegDataUri(uri: string, width: number, compress: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  try {
    context.resize({ width, height: null });
    const image = await context.renderAsync();
    try {
      const result = await image.saveAsync({
        base64: true,
        compress,
        format: SaveFormat.JPEG,
      });

      if (!result.base64) {
        throw new Error('Không thể chuyển ảnh sang dữ liệu JPEG.');
      }

      return `${JPEG_PREFIX}${result.base64}`;
    } finally {
      image.release();
    }
  } finally {
    context.release();
  }
}

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

  if (result.canceled) return null;

  const uri = result.assets[0]?.uri;
  if (!uri) throw new Error('Không thể đọc ảnh đã chọn.');

  for (const attempt of COMPRESSION_ATTEMPTS) {
    const dataUri = await createJpegDataUri(uri, attempt.width, attempt.compress);
    if (dataUri.length <= MAX_IMAGE_DATA_URI_LENGTH) return dataUri;
  }

  throw new Error(
    'Ảnh vẫn vượt quá giới hạn 180.000 ký tự sau khi nén. Vui lòng chọn ảnh đơn giản hoặc nhỏ hơn.',
  );
}
