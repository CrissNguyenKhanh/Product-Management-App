import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

export function LecturerAvatar({
  uri,
  fullname,
  size = 58,
}: {
  uri: string;
  fullname: string;
  size?: number;
}) {
  const initial = fullname.trim().charAt(0).toUpperCase();
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        accessibilityLabel={`Ảnh giảng viên ${fullname}`}
        source={{ uri }}
        style={[styles.image, shape]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, shape]}>
      {initial ? (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      ) : (
        <Ionicons color={colors.primary} name="school-outline" size={size * 0.48} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.primarySoft },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C8DAFF',
    overflow: 'hidden',
  },
  initial: { color: colors.primary, fontWeight: '800' },
});
