import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminGate } from '@/components/admin-gate';
import { AppScreen } from '@/components/app-screen';
import { PrimaryButton } from '@/components/primary-button';
import { useAuth } from '@/contexts/auth-context';
import { useUsers } from '@/hooks/use-users';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';

type MenuCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
};

function MenuCard({ icon, title, description, onPress }: MenuCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}>
      <View style={styles.menuIcon}>
        <Ionicons color={colors.primary} name={icon} size={25} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { users, loading, error } = useUsers();

  function confirmLogout() {
    Alert.alert('Đăng xuất?', 'Bạn sẽ cần đăng nhập lại để tiếp tục quản trị.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (nextError) {
            Alert.alert('Không thể đăng xuất', getErrorMessage(nextError));
          }
        },
      },
    ]);
  }

  return (
    <AdminGate>
      <AppScreen
        right={
          <PrimaryButton compact icon="log-out-outline" label="Đăng xuất" onPress={confirmLogout} variant="ghost" />
        }
        subtitle={user?.email ?? 'Admin'}
        title="Dashboard">
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View>
              <Text style={styles.eyebrow}>TỔNG NGƯỜI DÙNG</Text>
              <Text style={styles.total}>{loading ? '—' : users.length}</Text>
              <Text style={styles.totalHint}>Tài khoản được quản lý trên Firebase</Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons color="#FFFFFF" name="people" size={34} />
            </View>
          </View>

          {error ? (
            <View style={styles.warning}>
              <Ionicons color={colors.warning} name="warning-outline" size={20} />
              <Text style={styles.warningText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Quản trị nhanh</Text>
          <MenuCard
            description="Tìm kiếm, xem, sửa hoặc xóa tài khoản"
            icon="people-outline"
            onPress={() => router.push('/users')}
            title="Quản lý người dùng"
          />
          <MenuCard
            description="Tạo tài khoản mới và chọn ảnh đại diện"
            icon="person-add-outline"
            onPress={() => router.push('/user-form')}
            title="Thêm người dùng"
          />
        </ScrollView>
      </AppScreen>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.large, paddingTop: spacing.small, gap: spacing.medium },
  hero: {
    minHeight: 170,
    borderRadius: radius.large,
    backgroundColor: colors.primary,
    padding: spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  eyebrow: { color: '#DCE8FF', fontSize: 12, fontWeight: '800', letterSpacing: 1.1 },
  total: { color: '#FFFFFF', fontSize: 52, fontWeight: '900', lineHeight: 62 },
  totalHint: { color: '#DCE8FF', fontSize: 13, maxWidth: 210 },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: '#FFF4E8',
    borderRadius: radius.small,
    padding: spacing.medium,
  },
  warningText: { flex: 1, color: colors.warning, fontSize: 13, lineHeight: 19 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.small },
  menuCard: {
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 4 },
  menuTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  menuDescription: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});
