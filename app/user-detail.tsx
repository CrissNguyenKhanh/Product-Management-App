import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminGuard } from '../components/admin-guard';
import { ScreenHeader } from '../components/screen-header';
import { UserAvatar } from '../components/user-avatar';
import { deleteUser, getUser } from '../src/services/userService';
import { palette, shadow } from '../src/theme/appTheme';
import { ManagedUser } from '../src/types/user';
import { getErrorMessage } from '../src/utils/firebaseErrors';

export default function UserDetailScreen() {
  return (
    <AdminGuard>
      <UserDetailContent />
    </AdminGuard>
  );
}

function UserDetailContent() {
  const params = useLocalSearchParams<{ uid?: string }>();
  const uid = typeof params.uid === 'string' ? params.uid : '';
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    if (!uid) {
      setError('Thiếu mã định danh người dùng.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const result = await getUser(uid);
      if (!result) throw new Error('Người dùng không tồn tại hoặc đã bị xóa.');
      setUser(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Không thể tải thông tin người dùng.'));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      void loadUser();
    }, [loadUser]),
  );

  const confirmDelete = () => {
    if (!user || deleting) return;
    Alert.alert(
      'Xác nhận xóa',
      `Xóa “${user.username}” khỏi Firebase Authentication, Firestore và Storage? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteUser(user.uid);
              Alert.alert('Thành công', 'Người dùng đã được xóa.', [
                { text: 'OK', onPress: () => router.replace('/users') },
              ]);
            } catch (deleteError) {
              Alert.alert('Không thể xóa', getErrorMessage(deleteError));
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader back subtitle="Thông tin tài khoản được quản lý" title="Chi tiết người dùng" />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.stateText}>Đang tải thông tin...</Text>
        </View>
      ) : error || !user ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={50} color={palette.danger} />
          <Text style={styles.errorTitle}>{error}</Text>
          <TouchableOpacity onPress={loadUser} style={styles.retryButton}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.avatarRing}>
              <UserAvatar image={user.image} size={126} username={user.username} />
            </View>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={15} color={palette.success} />
              <Text style={styles.badgeText}>Tài khoản Firebase</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <InfoRow icon="person-outline" label="Username" value={user.username} />
            <View style={styles.divider} />
            <InfoRow icon="mail-outline" label="Email" value={user.email} />
            <View style={styles.divider} />
            <InfoRow icon="key-outline" label="Password" value="********" />
            <View style={styles.passwordNote}>
              <Ionicons name="information-circle-outline" size={18} color={palette.primary} />
              <Text style={styles.passwordNoteText}>
                Mật khẩu thật được Firebase Authentication bảo vệ và không thể đọc lại.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push({ pathname: '/user-form', params: { uid: user.uid } })}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={21} color={palette.white} />
            <Text style={styles.editText}>Chỉnh sửa người dùng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={deleting}
            onPress={confirmDelete}
            style={[styles.deleteButton, deleting && styles.disabled]}
          >
            {deleting ? (
              <ActivityIndicator color={palette.danger} />
            ) : (
              <Ionicons name="trash-outline" size={21} color={palette.danger} />
            )}
            <Text style={styles.deleteText}>Xóa người dùng</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={palette.primary} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text selectable style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.background, flex: 1 },
  content: { paddingBottom: 36, paddingHorizontal: 20 },
  centerState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  stateText: { color: palette.textMuted, marginTop: 12 },
  errorTitle: { color: palette.danger, fontSize: 15, lineHeight: 21, marginTop: 14, textAlign: 'center' },
  retryButton: { backgroundColor: palette.primary, borderRadius: 12, marginTop: 18, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: palette.white, fontWeight: '800' },
  profileCard: { alignItems: 'center', backgroundColor: palette.surface, borderRadius: 24, padding: 24, ...shadow },
  avatarRing: { borderColor: '#DBEAFE', borderRadius: 70, borderWidth: 5, padding: 4 },
  username: { color: palette.text, fontSize: 25, fontWeight: '900', marginTop: 16 },
  email: { color: palette.textMuted, fontSize: 14, marginTop: 6 },
  badge: {
    alignItems: 'center',
    backgroundColor: palette.successSoft,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: { color: palette.success, fontSize: 12, fontWeight: '800' },
  infoCard: { backgroundColor: palette.surface, borderRadius: 22, marginTop: 16, padding: 18, ...shadow },
  infoRow: { alignItems: 'center', flexDirection: 'row' },
  infoIcon: { alignItems: 'center', backgroundColor: palette.primarySoft, borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  infoCopy: { flex: 1, marginLeft: 13 },
  infoLabel: { color: palette.textMuted, fontSize: 12, fontWeight: '700' },
  infoValue: { color: palette.text, fontSize: 15, fontWeight: '700', marginTop: 4 },
  divider: { backgroundColor: palette.border, height: 1, marginVertical: 15 },
  passwordNote: {
    alignItems: 'flex-start',
    backgroundColor: palette.primarySoft,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
    padding: 12,
  },
  passwordNoteText: { color: '#1E3A8A', flex: 1, fontSize: 12, lineHeight: 17 },
  editButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
  },
  editText: { color: palette.white, fontSize: 15, fontWeight: '800' },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderColor: '#FECACA',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 54,
  },
  deleteText: { color: palette.danger, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.6 },
});
