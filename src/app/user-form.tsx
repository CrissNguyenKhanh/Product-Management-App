import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AdminGate } from '@/components/admin-gate';
import { AppScreen } from '@/components/app-screen';
import { FormField } from '@/components/form-field';
import { IconButton } from '@/components/icon-button';
import { LoadingView } from '@/components/loading-view';
import { PrimaryButton } from '@/components/primary-button';
import { UserAvatar } from '@/components/user-avatar';
import { PASSWORD_PLACEHOLDER } from '@/models/user';
import { pickAvatar } from '@/services/image-service';
import { createManagedUser, fetchUser, updateManagedUser } from '@/services/user-service';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';
import { validateEmail, validateUsername } from '@/utils/validation';

type FieldErrors = Partial<Record<'username' | 'email', string>>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function UserFormScreen() {
  const params = useLocalSearchParams<{ uid?: string | string[] }>();
  const uid = firstParam(params.uid);
  const editing = Boolean(uid);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!uid) return;

    let active = true;
    fetchUser(uid)
      .then((user) => {
        if (!active) return;
        if (!user) {
          setLoadError('Không tìm thấy người dùng cần chỉnh sửa.');
          return;
        }
        setUsername(user.username);
        setEmail(user.email);
        setAvatarUri(user.image.startsWith('data:image/jpeg;base64,') ? user.image : '');
      })
      .catch((error) => active && setLoadError(getErrorMessage(error)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [uid]);

  const title = useMemo(() => (editing ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ'), [editing]);

  async function handlePickAvatar() {
    try {
      const picked = await pickAvatar();
      if (picked) setAvatarUri(picked);
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', getErrorMessage(error));
    }
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    if (usernameError) nextErrors.username = usernameError;
    if (emailError) nextErrors.email = emailError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (submitting || !validate()) return;

    setSubmitting(true);

    try {
      const input = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        image: avatarUri,
      };
      let targetUid = uid;

      if (editing) {
        await updateManagedUser({
          uid,
          ...input,
        });
      } else {
        targetUid = await createManagedUser(input);
      }

      Alert.alert(
        'Thành công',
        editing
          ? 'Hồ sơ demo trên Firestore đã được cập nhật.'
          : 'Hồ sơ demo đã được thêm. Hồ sơ này không phải tài khoản đăng nhập.',
      );
      router.replace({ pathname: '/user-detail', params: { uid: targetUid } });
    } catch (error) {
      Alert.alert(editing ? 'Không thể cập nhật' : 'Không thể thêm hồ sơ', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminGate>
      <AppScreen
        right={<IconButton icon="close" label="Đóng" onPress={() => router.back()} />}
        subtitle="Hồ sơ demo trên Cloud Firestore — không tạo tài khoản đăng nhập"
        title={title}>
        {loading ? (
          <LoadingView label="Đang tải thông tin người dùng..." />
        ) : loadError ? (
          <View style={styles.centerState}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={48} />
            <Text style={styles.loadError}>{loadError}</Text>
            <PrimaryButton compact label="Quay lại" onPress={() => router.back()} variant="secondary" />
          </View>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.avatarCard}>
                <UserAvatar size={104} uri={avatarUri} username={username} />
                <View style={styles.avatarActions}>
                  <Pressable onPress={handlePickAvatar} style={styles.imageAction}>
                    <Ionicons color={colors.primary} name="image-outline" size={20} />
                    <Text style={styles.imageActionText}>{avatarUri ? 'Thay ảnh' : 'Chọn ảnh'}</Text>
                  </Pressable>
                  {avatarUri ? (
                    <Pressable onPress={() => setAvatarUri('')} style={styles.removeAction}>
                      <Ionicons color={colors.danger} name="trash-outline" size={18} />
                      <Text style={styles.removeActionText}>Xóa ảnh</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Text style={styles.imageHint}>
                  Ảnh được nén thành JPEG và lưu trong Firestore, tối đa 180.000 ký tự.
                </Text>
              </View>

              <View style={styles.formCard}>
                <FormField
                  autoCapitalize="none"
                  error={errors.username}
                  label="Username"
                  leftIcon="person-outline"
                  onChangeText={(value) => {
                    setUsername(value);
                    setErrors((current) => ({ ...current, username: undefined }));
                  }}
                  placeholder="nguyenvana"
                  value={username}
                />
                <FormField
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  keyboardType="email-address"
                  label="Email"
                  leftIcon="mail-outline"
                  onChangeText={(value) => {
                    setEmail(value);
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder="user@example.com"
                  value={email}
                />
                <FormField
                  editable={false}
                  label="Password demo (không dùng để đăng nhập)"
                  leftIcon="lock-closed-outline"
                  onChangeText={() => undefined}
                  value={PASSWORD_PLACEHOLDER}
                />

                <View style={styles.securityNote}>
                  <Ionicons color={colors.success} name="shield-checkmark-outline" size={22} />
                  <Text style={styles.securityText}>
                    Ứng dụng không thu thập hoặc lưu mật khẩu người dùng. Firestore chỉ lưu{' '}
                    {PASSWORD_PLACEHOLDER}; các hồ sơ này không thể đăng nhập Firebase Authentication.
                  </Text>
                </View>

                <PrimaryButton
                  icon={editing ? 'save-outline' : 'person-add-outline'}
                  label={editing ? 'Lưu thay đổi' : 'Thêm hồ sơ demo'}
                  loading={submitting}
                  onPress={handleSubmit}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </AppScreen>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.large, paddingTop: spacing.small, gap: spacing.medium, paddingBottom: 48 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xlarge, gap: spacing.medium },
  loadError: { color: colors.danger, textAlign: 'center', fontSize: 15, lineHeight: 22 },
  avatarCard: {
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.large,
  },
  avatarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.small, marginTop: spacing.small },
  imageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xsmall,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  imageActionText: { color: colors.primary, fontWeight: '700' },
  removeAction: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.small },
  removeActionText: { color: colors.danger, fontWeight: '700' },
  imageHint: { color: colors.textMuted, fontSize: 12 },
  formCard: {
    gap: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.large,
  },
  securityNote: {
    flexDirection: 'row',
    gap: spacing.small,
    backgroundColor: colors.successSoft,
    padding: spacing.medium,
    borderRadius: radius.small,
  },
  securityText: { flex: 1, color: colors.success, fontSize: 13, lineHeight: 19 },
});
