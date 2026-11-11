import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminGuard } from '../components/admin-guard';
import { useAuth } from '../src/contexts/AuthContext';
import { listUsers } from '../src/services/userService';
import { palette, shadow } from '../src/theme/appTheme';
import { getErrorMessage } from '../src/utils/firebaseErrors';

export default function DashboardScreen() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadCount = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      const users = await listUsers();
      setCount(users.length);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Không thể tải thống kê.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCount();
    }, [loadCount]),
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn kết thúc phiên quản trị?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadCount(true)} />}
        >
          <View style={styles.topRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>ADMIN WORKSPACE</Text>
              <Text style={styles.title}>User Management Dashboard</Text>
              <Text numberOfLines={1} style={styles.adminEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Đăng xuất" onPress={handleLogout} style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={23} color={palette.danger} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="people" size={32} color={palette.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.statLabel}>Tổng số người dùng</Text>
              {loading ? (
                <ActivityIndicator color={palette.primary} style={styles.loader} />
              ) : (
                <Text style={styles.statValue}>{count}</Text>
              )}
              <Text style={styles.statHint}>Tài khoản đang được quản lý trong Firestore</Text>
            </View>
          </View>

          {error ? (
            <TouchableOpacity onPress={() => loadCount()} style={styles.errorBox}>
              <Ionicons name="cloud-offline-outline" size={22} color={palette.danger} />
              <View style={styles.errorCopy}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText}>Chạm để thử lại</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <TouchableOpacity onPress={() => router.push('/users')} style={styles.actionCard}>
            <View style={[styles.actionIcon, styles.blueIcon]}>
              <Ionicons name="people-outline" size={26} color={palette.primary} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Quản lý người dùng</Text>
              <Text style={styles.actionSubtitle}>Xem, tìm kiếm, sửa hoặc xóa tài khoản</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={palette.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/user-form')} style={styles.actionCard}>
            <View style={[styles.actionIcon, styles.greenIcon]}>
              <Ionicons name="person-add-outline" size={26} color={palette.success} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Thêm người dùng</Text>
              <Text style={styles.actionSubtitle}>Tạo tài khoản Auth và hồ sơ Firestore</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={palette.textMuted} />
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={24} color={palette.primary} />
            <Text style={styles.securityText}>
              Mật khẩu thật do Firebase Authentication quản lý và không được lưu trong Firestore.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.background, flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, marginBottom: 24 },
  headerCopy: { flex: 1 },
  eyebrow: { color: palette.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: palette.text, fontSize: 28, fontWeight: '900', lineHeight: 34, marginTop: 7 },
  adminEmail: { color: palette.textMuted, fontSize: 14, marginTop: 7 },
  logoutIcon: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  heroCard: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    flexDirection: 'row',
    padding: 22,
    ...shadow,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 18,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  heroCopy: { flex: 1, marginLeft: 17 },
  statLabel: { color: '#DBEAFE', fontSize: 14, fontWeight: '700' },
  statValue: { color: palette.white, fontSize: 38, fontWeight: '900', marginTop: 1 },
  loader: { alignSelf: 'flex-start', marginVertical: 10 },
  statHint: { color: '#BFDBFE', fontSize: 12, lineHeight: 17, marginTop: 3 },
  errorBox: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    padding: 14,
  },
  errorCopy: { flex: 1 },
  errorText: { color: palette.danger, fontSize: 13 },
  retryText: { color: palette.danger, fontSize: 12, fontWeight: '800', marginTop: 3 },
  sectionTitle: { color: palette.text, fontSize: 18, fontWeight: '800', marginBottom: 12, marginTop: 28 },
  actionCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 19,
    flexDirection: 'row',
    marginBottom: 13,
    padding: 16,
    ...shadow,
  },
  actionIcon: { alignItems: 'center', borderRadius: 15, height: 52, justifyContent: 'center', width: 52 },
  blueIcon: { backgroundColor: palette.primarySoft },
  greenIcon: { backgroundColor: palette.successSoft },
  actionCopy: { flex: 1, marginHorizontal: 14 },
  actionTitle: { color: palette.text, fontSize: 16, fontWeight: '800' },
  actionSubtitle: { color: palette.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  securityNote: {
    alignItems: 'flex-start',
    backgroundColor: palette.primarySoft,
    borderRadius: 17,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    padding: 16,
  },
  securityText: { color: '#1E3A8A', flex: 1, fontSize: 13, lineHeight: 19 },
});
