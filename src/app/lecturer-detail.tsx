import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminGate } from '@/components/admin-gate';
import { AppScreen } from '@/components/app-screen';
import { IconButton } from '@/components/icon-button';
import { LecturerAvatar } from '@/components/lecturer-avatar';
import { LoadingView } from '@/components/loading-view';
import { PrimaryButton } from '@/components/primary-button';
import { StateView } from '@/components/state-view';
import { Lecturer } from '@/models/lecturer';
import { deleteLecturer, fetchLecturer } from '@/services/lecturer-service';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons color={colors.primary} name={icon} size={20} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text selectable style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function LecturerDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const documentId = firstParam(params.id);
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadLecturer = useCallback(async () => {
    if (!documentId) {
      setError('Thiếu document ID của giảng viên.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchLecturer(documentId);
      setLecturer(result);
      setError(result ? '' : 'Giảng viên không còn tồn tại.');
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useFocusEffect(useCallback(() => { void loadLecturer(); }, [loadLecturer]));

  function confirmDelete() {
    if (!lecturer || deleting) return;
    Alert.alert(
      'Xóa giảng viên?',
      `${lecturer.IDGV} — ${lecturer.Fullname} sẽ bị xóa khỏi collection GiangVien.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteLecturer(lecturer.id);
              Alert.alert('Đã xóa', 'Giảng viên đã được xóa khỏi Firestore.');
              router.replace('/lecturers');
            } catch (nextError) {
              Alert.alert('Không thể xóa', getErrorMessage(nextError));
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  return (
    <AdminGate>
      <AppScreen
        right={<IconButton icon="close" label="Đóng" onPress={() => router.back()} />}
        subtitle="Thông tin collection GiangVien"
        title="Chi tiết giảng viên">
        {loading ? (
          <LoadingView label="Đang tải chi tiết giảng viên..." />
        ) : error || !lecturer ? (
          <StateView
            actionLabel="Quay lại danh sách"
            icon="alert-circle-outline"
            message={error || 'Không tìm thấy giảng viên.'}
            onAction={() => router.replace('/lecturers')}
            title="Không thể hiển thị"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
              <LecturerAvatar fullname={lecturer.Fullname} size={124} uri={lecturer.Image} />
              <Text style={styles.fullname}>{lecturer.Fullname}</Text>
              <Text style={styles.lecturerId}>{lecturer.IDGV}</Text>
            </View>

            <View style={styles.detailsCard}>
              <DetailRow icon="id-card-outline" label="IDGV" value={lecturer.IDGV} />
              <View style={styles.divider} />
              <DetailRow icon="person-outline" label="Fullname" value={lecturer.Fullname} />
              <View style={styles.divider} />
              <DetailRow icon="layers-outline" label="SumClass" value={String(lecturer.SumClass)} />
              <View style={styles.divider} />
              <DetailRow
                icon="image-outline"
                label="Image"
                value={lecturer.Image ? 'Đã lưu ảnh JPEG trong Firestore' : 'Chưa có ảnh'}
              />
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                icon="create-outline"
                label="Chỉnh sửa"
                onPress={() => router.push({ pathname: '/lecturer-form', params: { id: lecturer.id } })}
                style={styles.flexButton}
                variant="secondary"
              />
              <PrimaryButton
                icon="trash-outline"
                label="Xóa"
                loading={deleting}
                onPress={confirmDelete}
                style={styles.flexButton}
                variant="danger"
              />
            </View>
          </ScrollView>
        )}
      </AppScreen>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.large, paddingTop: spacing.small, gap: spacing.medium, paddingBottom: 48 },
  profileCard: {
    alignItems: 'center',
    gap: spacing.xsmall,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xlarge,
  },
  fullname: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: spacing.small, textAlign: 'center' },
  lecturerId: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.medium,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.medium, paddingVertical: spacing.small },
  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1, gap: 3 },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 58 },
  actions: { flexDirection: 'row', gap: spacing.small },
  flexButton: { flex: 1 },
});
