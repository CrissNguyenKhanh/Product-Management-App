import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const palettes: Record<ButtonVariant, { background: string; text: string; border: string }> = {
  primary: { background: colors.primary, text: '#FFFFFF', border: colors.primary },
  secondary: { background: colors.primarySoft, text: colors.primary, border: colors.primarySoft },
  danger: { background: colors.danger, text: '#FFFFFF', border: colors.danger },
  ghost: { background: 'transparent', text: colors.textMuted, border: colors.border },
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  compact = false,
  style,
}: PrimaryButtonProps) {
  const palette = palettes[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.background, borderColor: palette.border },
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon ? <Ionicons color={palette.text} name={icon} size={compact ? 17 : 19} /> : null}
          <Text style={[styles.label, compact && styles.compactLabel, { color: palette.text }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingHorizontal: spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.small,
  },
  compact: { minHeight: 38, paddingHorizontal: 13, borderRadius: radius.small },
  label: { fontSize: 16, fontWeight: '700' },
  compactLabel: { fontSize: 13 },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.9 },
});
