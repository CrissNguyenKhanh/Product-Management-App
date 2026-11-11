import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { palette, shadow } from '../src/theme/appTheme';
import { getErrorMessage } from '../src/utils/firebaseErrors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { isAdmin, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && isAdmin) return <Redirect href="/dashboard" />;

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await login(normalizedEmail, password);
      router.replace('/dashboard');
    } catch (loginError) {
      setError(getErrorMessage(loginError, 'Đăng nhập thất bại.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandIcon}>
            <Ionicons name="people" size={46} color={palette.white} />
          </View>
          <Text style={styles.eyebrow}>ADMIN PORTAL</Text>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>
            Đăng nhập bằng tài khoản Admin để quản lý người dùng an toàn.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập Admin</Text>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={palette.textMuted} />
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError('');
                }}
                placeholder="admin@example.com"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={email}
              />
            </View>

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={palette.textMuted} />
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) setError('');
                }}
                onSubmitEditing={handleLogin}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
              />
              <TouchableOpacity
                accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onPress={() => setShowPassword((value) => !value)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={palette.textMuted}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={palette.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              disabled={submitting || authLoading}
              onPress={handleLogin}
              style={[styles.button, (submitting || authLoading) && styles.disabled]}
            >
              {submitting || authLoading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                  <Ionicons name="arrow-forward" size={20} color={palette.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.background, flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.primary,
    borderRadius: 24,
    height: 88,
    justifyContent: 'center',
    marginBottom: 20,
    width: 88,
    ...shadow,
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  title: { color: palette.text, fontSize: 32, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  subtitle: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    marginTop: 10,
    textAlign: 'center',
  },
  card: { backgroundColor: palette.surface, borderRadius: 24, padding: 22, ...shadow },
  cardTitle: { color: palette.text, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  label: { color: palette.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputRow: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 17,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  input: { color: palette.text, flex: 1, fontSize: 16, paddingHorizontal: 10, paddingVertical: 12 },
  errorBox: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    padding: 12,
  },
  errorText: { color: palette.danger, flex: 1, fontSize: 13, lineHeight: 18 },
  button: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 15,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 56,
  },
  disabled: { opacity: 0.65 },
  buttonText: { color: palette.white, fontSize: 16, fontWeight: '800' },
});
