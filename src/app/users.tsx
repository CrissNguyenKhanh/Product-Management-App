import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AdminGate } from '@/components/admin-gate';
import { AppScreen } from '@/components/app-screen';
import { IconButton } from '@/components/icon-button';
import { LoadingView } from '@/components/loading-view';
import { PrimaryButton } from '@/components/primary-button';
import { StateView } from '@/components/state-view';
import { UserAvatar } from '@/components/user-avatar';
import { useUsers } from '@/hooks/use-users';
import { ManagedUser } from '@/models/user';
import { deleteManagedUser } from '@/services/user-service';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';

function UserCard({
  user,
  deleting,
  onDelete,
}: {
  user: ManagedUser;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.userRow}>
        <UserAvatar size={56} uri={user.image} username={user.username} />
        <View style={styles.userInfo}>
          <Text numberOfLines={1} style={styles.username}>
            {user.username}
          </Text>
          <Text numberOfLines={1} style={styles.email}>
            {user.email}
          </Text>
          <Text style={styles.password}>Mật khẩu: ********</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <IconButton
          backgroundColor={colors.primarySoft}
          color={colors.primary}
          icon="eye-outline"
          label={`Xem ${user.username}`}
          onPress={() => router.push({ pathname: '/user-detail', params: { uid: user.id } })}
        />
        <IconButton
          icon="create-outline"
          label={`Sửa ${user.username}`}
          onPress={() => router.push({ pathname: '/user-form', params: { uid: user.id } })}
        />
        <IconButton
          backgroundColor={colors.dangerSoft}
          color={colors.danger}
          disabled={deleting}
          icon="trash-outline"
          label={`Xóa ${user.username}`}
          onPress={onDelete}
        />
        {deleting ? <ActivityIndicator color={colors.danger} size="small" /> : null}
      </View>
    </View>
  );
}

export default function UsersScreen() {
  const { users, loading, refreshing, error, refresh } = useUsers();
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.username.toLocaleLowerCase('vi').includes(normalized) ||
        user.email.toLocaleLowerCase('vi').includes(normalized),
    );
  }, [query, users]);

  function confirmDelete(user: ManagedUser) {
    Alert.alert('Xóa người dùng?', `${user.username} và tài khoản đăng nhập tương ứng sẽ bị xóa.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(user.id);
          try {
            await deleteManagedUser(user.id);
            Alert.alert('Đã xóa', 'Người dùng đã được xóa khỏi hệ thống.');
          } catch (nextError) {
            Alert.alert('Không thể xóa', getErrorMessage(nextError));
          } finally {
            setDeletingId('');
          }
        },
      },
    ]);
  }

  return (
    <AdminGate>
      <AppScreen
        right={<PrimaryButton compact icon="person-add-outline" label="Thêm" onPress={() => router.push('/user-form')} />}
        subtitle={`${users.length} người dùng`}
        title="Danh sách người dùng">
        <View style={styles.toolbar}>
          <IconButton icon="arrow-back" label="Quay lại Dashboard" onPress={() => router.back()} />
          <View style={styles.searchBox}>
            <Ionicons color={colors.textMuted} name="search-outline" size={20} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Tìm username hoặc email"
              placeholderTextColor="#98A2B3"
              style={styles.searchInput}
              value={query}
            />
            {query ? (
              <IconButton
                backgroundColor="transparent"
                icon="close-circle"
                label="Xóa tìm kiếm"
                onPress={() => setQuery('')}
                style={styles.clearButton}
              />
            ) : null}
          </View>
        </View>

        {loading ? (
          <LoadingView label="Đang tải người dùng từ Firebase..." />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              error ? (
                <StateView
                  actionLabel="Thử lại"
                  icon="cloud-offline-outline"
                  message={error}
                  onAction={refresh}
                  title="Không thể tải dữ liệu"
                />
              ) : query ? (
                <StateView
                  icon="search-outline"
                  message="Hãy thử một username hoặc email khác."
                  title="Không tìm thấy kết quả"
                />
              ) : (
                <StateView
                  actionLabel="Thêm người dùng"
                  message="Tạo người dùng đầu tiên để bắt đầu quản lý."
                  onAction={() => router.push('/user-form')}
                  title="Danh sách đang trống"
                />
              )
            }
            refreshControl={
              <RefreshControl colors={[colors.primary]} onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
            }
            renderItem={({ item }) => (
              <UserCard
                deleting={deletingId === item.id}
                onDelete={() => confirmDelete(item)}
                user={item}
              />
            )}
          />
        )}
      </AppScreen>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.medium,
  },
  searchBox: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    paddingLeft: spacing.medium,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 10 },
  clearButton: { width: 38, height: 38, borderWidth: 0 },
  listContent: { flexGrow: 1, gap: spacing.medium, padding: spacing.large, paddingTop: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.medium,
    gap: spacing.medium,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.medium },
  userInfo: { flex: 1, gap: 3 },
  username: { color: colors.text, fontSize: 17, fontWeight: '800' },
  email: { color: colors.textMuted, fontSize: 14 },
  password: { color: colors.textMuted, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.small,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.small,
  },
});
