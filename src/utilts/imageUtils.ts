import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type PickedImage = {
  uri: string;
  dataUrl: string;
};

export async function pickUserImage(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Bạn cần cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const manipulated = await manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 640, height: 640 } }],
    { compress: 0.72, format: SaveFormat.JPEG },
  );

  const base64 = await new File(manipulated.uri).base64();
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  if (dataUrl.length > 1_500_000) {
    throw new Error('Ảnh quá lớn sau khi xử lý. Vui lòng chọn ảnh khác.');
  }

  return { uri: manipulated.uri, dataUrl };
}
