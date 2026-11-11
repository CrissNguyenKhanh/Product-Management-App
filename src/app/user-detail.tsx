import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminGate } from '@/components/admin-gate';
import { AppScreen } from '@/components/app-screen';
import { IconButton } from '@/components/icon-button';
import { LoadingView } from '@/components/loading-view';
import { PrimaryButton } from '@/components/primary-button';
import { StateView } from '@/components/state-view';
import { UserAvatar } from '@/components/user-avatar';
import { ManagedUser } from '@/models/user';
import { deleteManagedUser, fetchUser } from '@/services/user-service';
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
        <Text selectable style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function UserDetailScreen() {
  const params = useLocalSearchParams<{ uid?: string | string[] }>();
  const uid = firstParam(params.uid);
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadUser = useCallback(async () => {
    if (!uid) {
      setError('Thiếu mã định danh người dùng.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchUser(uid);
      setUser(result);
      setError(result ? '' : 'Người dùng không còn tồn tại.');
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      void loadUser();
    }, [loadUser]),
  );

  function confirmDelete() {
    if (!user || deleting) return;
    Alert.alert('Xóa người dùng?', `${user.username} sẽ bị xóa vĩnh viễn khỏi Auth, Firestore và Storage.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteManagedUser(user.id);
            Alert.alert('Đã xóa', 'Người dùng đã được xóa khỏi hệ thống.');
            router.replace('/users');
          } catch (nextError) {
            Alert.alert('Không thể xóa', getErrorMessage(nextError));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <AdminGate>
      <AppScreen
        right={<IconButton icon="close" label="Đóng" onPress={() => router.back()} />}
        subtitle="Thông tin tài khoản Firebase"
        title="Chi tiết người dùng">
        {loading ? (
          <LoadingView label="Đang tải chi tiết..." />
        ) : error || !user ? (
          <StateView
            actionLabel="Quay lại danh sách"
            icon="alert-circle-outline"
            message={error || 'Không tìm thấy người dùng.'}
            onAction={() => router.replace('/users')}
            title="Không thể hiển thị"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
              <UserAvatar size={124} uri={user.image} username={user.username} />
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.detailsCard}>
              <DetailRow icon="person-outline" label="Username" value={user.username} />
              <View style={styles.divider} />
              <DetailRow icon="mail-outline" label="Email" value={user.email} />
              <View style={styles.divider} />
              <DetailRow icon="lock-closed-outline" label="Password" value="********" />
              <View style={styles.divider} />
              <DetailRow
                icon="image-outline"
                label="Image"
                value={user.image ? 'Đã có ảnh đại diện' : 'Chưa có ảnh đại diện'}
              />
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                icon="create-outline"
                label="Chỉnh sửa"
                onPress={() => router.push({ pathname: '/user-form', params: { uid: user.id } })}
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
  username: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: spacing.small },
  email: { color: colors.textMuted, fontSize: 15 },
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
