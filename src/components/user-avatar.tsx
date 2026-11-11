import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

export function UserAvatar({
  uri,
  username,
  size = 58,
}: {
  uri: string;
  username: string;
  size?: number;
}) {
  const initial = username.trim().charAt(0).toUpperCase();
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image accessibilityLabel={`Avatar của ${username}`} source={{ uri }} style={[styles.image, shape]} />;
  }

  return (
    <View style={[styles.placeholder, shape]}>
      {initial ? (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      ) : (
        <Ionicons color={colors.primary} name="person-outline" size={size * 0.48} />
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
