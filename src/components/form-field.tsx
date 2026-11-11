import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';

type FormFieldProps = Pick<
  TextInputProps,
  'autoCapitalize' | 'autoComplete' | 'editable' | 'onBlur' | 'returnKeyType'
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  leftIcon,
  right,
  ...inputProps
}: FormFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error ? styles.inputError : null]}>
        {leftIcon ? <Ionicons color={colors.textMuted} name={leftIcon} size={20} /> : null}
        <TextInput
          {...inputProps}
          autoCorrect={false}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          secureTextEntry={secureTextEntry && hidden}
          style={styles.input}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={hidden ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'}
            hitSlop={10}
            onPress={() => setHidden((current) => !current)}>
            <Ionicons color={colors.textMuted} name={hidden ? 'eye-outline' : 'eye-off-outline'} size={21} />
          </Pressable>
        ) : (
          right
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xsmall },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  inputShell: {
    minHeight: 52,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
