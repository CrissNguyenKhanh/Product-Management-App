import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { palette } from '../src/theme/appTheme';

type Props = {
  image: string;
  username: string;
  size?: number;
};

export function UserAvatar({ image, username, size = 56 }: Props) {
  if (image) {
    return (
      <Image
        accessibilityLabel={`Ảnh đại diện của ${username}`}
        source={{ uri: image }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  const initial = username.trim().charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {initial ? (
        <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.48} color={palette.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: palette.primarySoft },
  placeholder: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    justifyContent: 'center',
  },
  initial: { color: palette.primary, fontWeight: '800' },
});
