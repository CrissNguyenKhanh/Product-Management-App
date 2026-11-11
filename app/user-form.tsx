import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { AdminGuard } from '../components/admin-guard';
import { ScreenHeader } from '../components/screen-header';
import { UserAvatar } from '../components/user-avatar';
import { removeAvatar, uploadAvatar } from '../src/services/imageService';
import { createUser, getUser, updateUser } from '../src/services/userService';
import { palette, shadow } from '../src/theme/appTheme';
import { ManagedUser } from '../src/types/user';
import { getErrorMessage } from '../src/utils/firebaseErrors';
import { PickedImage, pickUserImage } from '../src/utilts/imageUtils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserFormScreen() {
  return (
    <AdminGuard>
      <UserFormContent />
    </AdminGuard>
  );
}

function UserFormContent() {
  const params = useLocalSearchParams<{ uid?: string }>();
  const uid = typeof params.uid === 'string' ? params.uid : '';
  const editing = Boolean(uid);

  const [currentUser, setCurrentUser] = useState<ManagedUser | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [pickingImage, setPickingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!uid) return;
    let active = true;
    void getUser(uid)
      .then((user) => {
        if (!active) return;
        if (!user) {
          setLoadError('Không tìm thấy người dùng này.');
          return;
        }
        setCurrentUser(user);
        setUsername(user.username);
        setEmail(user.email);
      })
      .catch((error) => {
        if (active) setLoadError(getErrorMessage(error, 'Không thể tải người dùng.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [uid]);

  const chooseImage = async () => {
    try {
      setPickingImage(true);
      const image = await pickUserImage();
      if (image) {
        setPickedImage(image);
        setImageRemoved(false);
      }
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', getErrorMessage(error));
    } finally {
      setPickingImage(false);
    }
  };

  const validate = () => {
    if (!username.trim()) return 'Username không được để trống.';
    if (!EMAIL_PATTERN.test(email.trim())) return 'Email không hợp lệ.';
    if (!editing && password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (editing && password && password.length < 6) {
      return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    }
    return '';
  };

  const finish = (message: string) => {
    Alert.alert('Thành công', message, [
      { text: 'OK', onPress: () => router.replace('/users') },
    ]);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const validationError = validate();
    if (validationError) {
      Alert.alert('Dữ liệu chưa hợp lệ', validationError);
      return;
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    let createdUid = '';

    try {
      setSubmitting(true);
      if (!editing) {
        createdUid = await createUser({
          username: cleanUsername,
          email: cleanEmail,
          password,
        });

        if (pickedImage) {
          const imageUrl = await uploadAvatar(createdUid, pickedImage.dataUrl);
          await updateUser({
            uid: createdUid,
            username: cleanUsername,
            email: cleanEmail,
            image: imageUrl,
          });
        }

        finish('Đã tạo tài khoản và hồ sơ người dùng.');
        return;
      }

      if (!currentUser) throw new Error('Không tìm thấy dữ liệu người dùng để cập nhật.');

      let imageUrl = imageRemoved ? '' : currentUser.image;
      if (pickedImage) {
        imageUrl = await uploadAvatar(uid, pickedImage.dataUrl);
      }

      await updateUser({
        uid,
        username: cleanUsername,
        email: cleanEmail,
        image: imageUrl,
        ...(password ? { password } : {}),
      });

      if (imageRemoved && currentUser.image && !pickedImage) {
        try {
          await removeAvatar(uid);
        } catch (imageError) {
          Alert.alert(
            'Đã lưu thông tin',
            `Hồ sơ đã cập nhật nhưng chưa xóa được tệp ảnh cũ: ${getErrorMessage(imageError)}`,
            [{ text: 'OK', onPress: () => router.replace('/users') }],
          );
          return;
        }
      }

      finish('Thông tin người dùng đã được cập nhật.');
    } catch (error) {
      if (createdUid) {
        Alert.alert(
          'Đã tạo tài khoản nhưng ảnh chưa hoàn tất',
          `Tài khoản đã được tạo an toàn. Ảnh đại diện chưa thể lưu: ${getErrorMessage(error)}`,
          [{ text: 'OK', onPress: () => router.replace('/users') }],
        );
      } else {
        Alert.alert(editing ? 'Cập nhật thất bại' : 'Tạo người dùng thất bại', getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri = pickedImage?.uri || (!imageRemoved ? currentUser?.image : '') || '';

  if (loading) {
    return (
      <SafeAreaView style={styles.centerState} edges={['top', 'bottom']}>
        <ActivityIndicator color={palette.primary} size="large" />
        <Text style={styles.stateText}>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader back title="Không thể mở biểu mẫu" />
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={48} color={palette.danger} />
          <Text style={styles.errorTitle}>{loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        subtitle={editing ? 'Chỉnh sửa hồ sơ và thông tin xác thực' : 'Tạo tài khoản Firebase mới'}
        title={editing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageCard}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.preview} />
            ) : (
              <UserAvatar image="" size={104} username={username} />
            )}
            <View style={styles.imageActions}>
              <TouchableOpacity disabled={pickingImage} onPress={chooseImage} style={styles.imageButton}>
                {pickingImage ? (
                  <ActivityIndicator color={palette.primary} size="small" />
                ) : (
                  <Ionicons name="images-outline" size={19} color={palette.primary} />
                )}
                <Text style={styles.imageButtonText}>{previewUri ? 'Thay ảnh' : 'Chọn ảnh'}</Text>
              </TouchableOpacity>
              {previewUri ? (
                <TouchableOpacity
                  onPress={() => {
                    setPickedImage(null);
                    setImageRemoved(true);
                  }}
                  style={styles.removeImageButton}
                >
                  <Ionicons name="trash-outline" size={18} color={palette.danger} />
                  <Text style={styles.removeImageText}>Xóa ảnh</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.imageHint}>Ảnh là tùy chọn. Hỗ trợ ảnh vuông từ thư viện iPhone.</Text>
          </View>

          <View style={styles.formCard}>
            <FormLabel icon="person-outline" text="Username" />
            <TextInput
              autoCapitalize="none"
              onChangeText={setUsername}
              placeholder="Ví dụ: nguyenvana"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={username}
            />

            <FormLabel icon="mail-outline" text="Email" />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="user@example.com"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={email}
            />

            <FormLabel icon="lock-closed-outline" text={editing ? 'Mật khẩu mới' : 'Mật khẩu'} />
            <View style={styles.passwordInput}>
              <TextInput
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder={editing ? 'Để trống nếu không đổi' : 'Tối thiểu 6 ký tự'}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                style={styles.passwordTextInput}
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
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={19} color={palette.primary} />
              <Text style={styles.securityText}>
                Mật khẩu thật chỉ được gửi tới Firebase Authentication. Firestore chỉ lưu giá trị đại diện an toàn.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            disabled={submitting}
            onPress={handleSubmit}
            style={[styles.submitButton, submitting && styles.disabled]}
          >
            {submitting ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <>
                <Ionicons name={editing ? 'save-outline' : 'person-add-outline'} size={21} color={palette.white} />
                <Text style={styles.submitText}>{editing ? 'Lưu thay đổi' : 'Thêm người dùng'}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormLabel({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.labelRow}>
      <Ionicons name={icon} size={17} color={palette.primary} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.background, flex: 1 },
  flex: { flex: 1 },
  content: { paddingBottom: 36, paddingHorizontal: 20 },
  centerState: {
    alignItems: 'center',
    backgroundColor: palette.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stateText: { color: palette.textMuted, marginTop: 12 },
  errorTitle: { color: palette.danger, fontSize: 16, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  imageCard: { alignItems: 'center', backgroundColor: palette.surface, borderRadius: 22, padding: 20, ...shadow },
  preview: { backgroundColor: palette.primarySoft, borderRadius: 52, height: 104, width: 104 },
  imageActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  imageButton: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  imageButtonText: { color: palette.primary, fontSize: 13, fontWeight: '800' },
  removeImageButton: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  removeImageText: { color: palette.danger, fontSize: 13, fontWeight: '800' },
  imageHint: { color: palette.textMuted, fontSize: 12, marginTop: 13, textAlign: 'center' },
  formCard: { backgroundColor: palette.surface, borderRadius: 22, marginTop: 16, padding: 20, ...shadow },
  labelRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginBottom: 8 },
  label: { color: palette.text, fontSize: 13, fontWeight: '800' },
  input: {
    borderColor: palette.border,
    borderRadius: 13,
    borderWidth: 1,
    color: palette.text,
    fontSize: 15,
    marginBottom: 18,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passwordInput: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  passwordTextInput: { color: palette.text, flex: 1, fontSize: 15, paddingRight: 10, paddingVertical: 12 },
  securityNote: {
    alignItems: 'flex-start',
    backgroundColor: palette.primarySoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
    padding: 12,
  },
  securityText: { color: '#1E3A8A', flex: 1, fontSize: 12, lineHeight: 17 },
  submitButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 56,
    ...shadow,
  },
  submitText: { color: palette.white, fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.6 },
});
