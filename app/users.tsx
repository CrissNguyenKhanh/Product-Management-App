import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
import { deleteUser, listUsers, subscribeToUsers } from '../src/services/userService';
import { palette, shadow } from '../src/theme/appTheme';
import { ManagedUser } from '../src/types/user';
import { getErrorMessage } from '../src/utils/firebaseErrors';

export default function UsersScreen() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUid, setDeletingUid] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToUsers(
      (nextUsers) => {
        setUsers(nextUsers);
        setError('');
        setLoading(false);
      },
      (loadError) => {
        setError(getErrorMessage(loadError, 'Không thể tải danh sách người dùng.'));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = keyword.trim().toLocaleLowerCase('vi');
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.username.toLocaleLowerCase('vi').includes(normalized) ||
        user.email.toLocaleLowerCase('vi').includes(normalized),
    );
  }, [keyword, users]);

  const refresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setUsers(await listUsers());
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, 'Làm mới danh sách thất bại.'));
    } finally {
      setRefreshing(false);
    }
  };

  const confirmDelete = (user: ManagedUser) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc muốn xóa “${user.username}”? Tài khoản Auth, hồ sơ và ảnh đại diện sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingUid(user.uid);
              await deleteUser(user.uid);
              Alert.alert('Thành công', 'Đã xóa người dùng khỏi hệ thống.');
            } catch (deleteError) {
              Alert.alert('Không thể xóa', getErrorMessage(deleteError));
            } finally {
              setDeletingUid('');
            }
          },
        },
      ],
    );
  };

  const renderUser = ({ item }: { item: ManagedUser }) => (
    <View style={styles.card}>
      <TouchableOpacity
        accessibilityLabel={`Xem chi tiết ${item.username}`}
        onPress={() => router.push({ pathname: '/user-detail', params: { uid: item.uid } })}
        style={styles.profileRow}
      >
        <UserAvatar image={item.image} size={58} username={item.username} />
        <View style={styles.profileCopy}>
          <Text numberOfLines={1} style={styles.username}>{item.username || 'Chưa có username'}</Text>
          <Text numberOfLines={1} style={styles.email}>{item.email}</Text>
          <View style={styles.passwordRow}>
            <Ionicons name="key-outline" size={13} color={palette.textMuted} />
            <Text style={styles.password}>********</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
      </TouchableOpacity>

      <View style={styles.divider} />
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/user-detail', params: { uid: item.uid } })}
          style={styles.secondaryAction}
        >
          <Ionicons name="eye-outline" size={18} color={palette.primary} />
          <Text style={styles.secondaryText}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/user-form', params: { uid: item.uid } })}
          style={styles.secondaryAction}
        >
          <Ionicons name="create-outline" size={18} color={palette.primary} />
          <Text style={styles.secondaryText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={Boolean(deletingUid)}
          onPress={() => confirmDelete(item)}
          style={[styles.deleteAction, Boolean(deletingUid) && styles.disabled]}
        >
          {deletingUid === item.uid ? (
            <ActivityIndicator color={palette.danger} size="small" />
          ) : (
            <Ionicons name="trash-outline" size={18} color={palette.danger} />
          )}
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        subtitle={`${filteredUsers.length} / ${users.length} người dùng`}
        title="Danh sách người dùng"
        right={
          <TouchableOpacity
            accessibilityLabel="Thêm người dùng"
            onPress={() => router.push('/user-form')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={25} color={palette.white} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={palette.textMuted} />
        <TextInput
          autoCapitalize="none"
          onChangeText={setKeyword}
          placeholder="Tìm theo username hoặc email"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={keyword}
        />
        {keyword ? (
          <TouchableOpacity accessibilityLabel="Xóa từ khóa" onPress={() => setKeyword('')}>
            <Ionicons name="close-circle" size={20} color={palette.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <TouchableOpacity onPress={refresh} style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={22} color={palette.danger} />
          <Text style={styles.errorText}>{error} Chạm để thử lại.</Text>
        </TouchableOpacity>
      ) : null}

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.stateText}>Đang tải dữ liệu từ Firestore...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.list,
            filteredUsers.length === 0 && styles.emptyList,
          ]}
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={keyword ? 'search-outline' : 'people-outline'}
                  size={38}
                  color={palette.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {keyword ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
              </Text>
              <Text style={styles.stateText}>
                {keyword
                  ? 'Hãy thử một username hoặc email khác.'
                  : 'Nhấn nút + để tạo người dùng đầu tiên.'}
              </Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.background, flex: 1 },
  addButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 20,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  searchInput: { color: palette.text, flex: 1, fontSize: 15, paddingHorizontal: 10, paddingVertical: 11 },
  errorBox: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 13,
  },
  errorText: { color: palette.danger, flex: 1, fontSize: 13, lineHeight: 18 },
  centerState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  stateText: { color: palette.textMuted, fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: 'center' },
  list: { paddingBottom: 30, paddingHorizontal: 20, paddingTop: 4 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: palette.surface, borderRadius: 20, marginBottom: 14, padding: 16, ...shadow },
  profileRow: { alignItems: 'center', flexDirection: 'row' },
  profileCopy: { flex: 1, marginHorizontal: 13 },
  username: { color: palette.text, fontSize: 17, fontWeight: '800' },
  email: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  passwordRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 5 },
  password: { color: palette.textMuted, fontSize: 12, letterSpacing: 1 },
  divider: { backgroundColor: palette.border, height: 1, marginVertical: 14 },
  actions: { flexDirection: 'row', gap: 8 },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 11,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 39,
  },
  secondaryText: { color: palette.primary, fontSize: 13, fontWeight: '700' },
  deleteAction: {
    alignItems: 'center',
    backgroundColor: palette.dangerSoft,
    borderRadius: 11,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 39,
  },
  deleteText: { color: palette.danger, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  emptyState: { alignItems: 'center', padding: 30 },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 30,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  emptyTitle: { color: palette.text, fontSize: 18, fontWeight: '800', marginTop: 18 },
});
