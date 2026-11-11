import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { useAuth } from '@/contexts/auth-context';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';
import { validateEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { user, isAdmin, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && user && isAdmin) return <Redirect href="/dashboard" />;

  async function handleLogin() {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons color="#FFFFFF" name="people" size={42} />
            </View>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>Đăng nhập bằng tài khoản Admin để quản lý hồ sơ demo.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập Admin</Text>
            <FormField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              leftIcon="mail-outline"
              onChangeText={setEmail}
              placeholder="admin@example.com"
              value={email}
            />
            <FormField
              autoCapitalize="none"
              autoComplete="current-password"
              label="Mật khẩu"
              leftIcon="lock-closed-outline"
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={password}
            />
            {error ? (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Ionicons color={colors.danger} name="alert-circle-outline" size={20} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <PrimaryButton
              disabled={authLoading}
              icon="log-in-outline"
              label="Đăng nhập"
              loading={submitting}
              onPress={handleLogin}
            />
            <Text style={styles.hint}>Quyền Admin được xác minh bằng Firebase custom claims.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.large, gap: spacing.xlarge },
  brand: { alignItems: 'center', gap: spacing.small },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: spacing.small },
  subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 330 },
  card: {
    gap: spacing.medium,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    padding: spacing.large,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.small,
    backgroundColor: colors.dangerSoft,
    padding: spacing.small,
    borderRadius: radius.small,
  },
  errorText: { color: colors.danger, flex: 1, fontSize: 13, lineHeight: 19 },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 12, lineHeight: 17 },
});
