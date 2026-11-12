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
import { LecturerAvatar } from '@/components/lecturer-avatar';
import { LoadingView } from '@/components/loading-view';
import { PrimaryButton } from '@/components/primary-button';
import { pickLecturerImage } from '@/services/image-service';
import { createLecturer, fetchLecturer, updateLecturer } from '@/services/lecturer-service';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';
import {
  validateFullname,
  validateLecturerId,
  validateSumClass,
} from '@/utils/validation';

type FieldErrors = Partial<Record<'IDGV' | 'Fullname' | 'SumClass', string>>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function LecturerFormScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const documentId = firstParam(params.id);
  const editing = Boolean(documentId);
  const [IDGV, setIDGV] = useState('');
  const [Fullname, setFullname] = useState('');
  const [SumClass, setSumClass] = useState('');
  const [Image, setImage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!documentId) return;

    let active = true;
    fetchLecturer(documentId)
      .then((lecturer) => {
        if (!active) return;
        if (!lecturer) {
          setLoadError('Không tìm thấy giảng viên cần chỉnh sửa.');
          return;
        }
        setIDGV(lecturer.IDGV);
        setFullname(lecturer.Fullname);
        setSumClass(String(lecturer.SumClass));
        setImage(lecturer.Image.startsWith('data:image/jpeg;base64,') ? lecturer.Image : '');
      })
      .catch((error) => active && setLoadError(getErrorMessage(error)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [documentId]);

  const title = useMemo(
    () => (editing ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên'),
    [editing],
  );

  async function handlePickImage() {
    try {
      const picked = await pickLecturerImage();
      if (picked) setImage(picked);
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', getErrorMessage(error));
    }
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    const lecturerIdError = validateLecturerId(IDGV);
    const fullnameError = validateFullname(Fullname);
    const sumClassError = validateSumClass(SumClass);
    if (lecturerIdError) nextErrors.IDGV = lecturerIdError;
    if (fullnameError) nextErrors.Fullname = fullnameError;
    if (sumClassError) nextErrors.SumClass = sumClassError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      const input = {
        IDGV: IDGV.trim().toUpperCase(),
        Fullname: Fullname.trim(),
        Image,
        SumClass: Number(SumClass),
      };
      let targetId = documentId;

      if (editing) {
        await updateLecturer({ documentId, ...input });
      } else {
        targetId = await createLecturer(input);
      }

      Alert.alert(
        'Thành công',
        editing ? 'Thông tin giảng viên đã được cập nhật.' : 'Giảng viên mới đã được thêm.',
      );
      router.replace({ pathname: '/lecturer-detail', params: { id: targetId } });
    } catch (error) {
      Alert.alert(
        editing ? 'Không thể cập nhật' : 'Không thể thêm giảng viên',
        getErrorMessage(error),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminGate>
      <AppScreen
        right={<IconButton icon="close" label="Đóng" onPress={() => router.back()} />}
        subtitle="Collection GiangVien — cơ sở dữ liệu QLHocPhan"
        title={title}>
        {loading ? (
          <LoadingView label="Đang tải thông tin giảng viên..." />
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
              <View style={styles.imageCard}>
                <LecturerAvatar fullname={Fullname} size={104} uri={Image} />
                <View style={styles.imageActions}>
                  <Pressable onPress={handlePickImage} style={styles.imageAction}>
                    <Ionicons color={colors.primary} name="image-outline" size={20} />
                    <Text style={styles.imageActionText}>{Image ? 'Thay ảnh' : 'Chọn ảnh'}</Text>
                  </Pressable>
                  {Image ? (
                    <Pressable onPress={() => setImage('')} style={styles.removeAction}>
                      <Ionicons color={colors.danger} name="trash-outline" size={18} />
                      <Text style={styles.removeActionText}>Xóa ảnh</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Text style={styles.imageHint}>
                  Image được nén JPEG và lưu trong Firestore, tối đa 180.000 ký tự.
                </Text>
              </View>

              <View style={styles.formCard}>
                <FormField
                  autoCapitalize="characters"
                  error={errors.IDGV}
                  label="IDGV — Mã giảng viên"
                  leftIcon="id-card-outline"
                  onChangeText={(value) => {
                    setIDGV(value);
                    setErrors((current) => ({ ...current, IDGV: undefined }));
                  }}
                  placeholder="GV001"
                  value={IDGV}
                />
                <FormField
                  autoCapitalize="words"
                  error={errors.Fullname}
                  label="Fullname — Họ và tên"
                  leftIcon="person-outline"
                  onChangeText={(value) => {
                    setFullname(value);
                    setErrors((current) => ({ ...current, Fullname: undefined }));
                  }}
                  placeholder="Nguyễn Văn An"
                  value={Fullname}
                />
                <FormField
                  error={errors.SumClass}
                  keyboardType="number-pad"
                  label="SumClass — Tổng số lớp"
                  leftIcon="layers-outline"
                  onChangeText={(value) => {
                    setSumClass(value);
                    setErrors((current) => ({ ...current, SumClass: undefined }));
                  }}
                  placeholder="5"
                  value={SumClass}
                />

                <View style={styles.schemaNote}>
                  <Ionicons color={colors.success} name="checkmark-circle-outline" size={22} />
                  <Text style={styles.schemaText}>
                    Document chỉ lưu đúng bốn trường: IDGV, Fullname, Image và SumClass.
                  </Text>
                </View>

                <PrimaryButton
                  icon={editing ? 'save-outline' : 'person-add-outline'}
                  label={editing ? 'Lưu thay đổi' : 'Thêm giảng viên'}
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
  imageCard: {
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.large,
  },
  imageActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.small, marginTop: spacing.small },
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
  imageHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  formCard: {
    gap: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.large,
  },
  schemaNote: {
    flexDirection: 'row',
    gap: spacing.small,
    backgroundColor: colors.successSoft,
    padding: spacing.medium,
    borderRadius: radius.small,
  },
  schemaText: { flex: 1, color: colors.success, fontSize: 13, lineHeight: 19 },
});
