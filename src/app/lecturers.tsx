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
import { LecturerAvatar } from '@/components/lecturer-avatar';
import { LoadingView } from '@/components/loading-view';
import { PrimaryButton } from '@/components/primary-button';
import { StateView } from '@/components/state-view';
import { useLecturers } from '@/hooks/use-lecturers';
import { Lecturer } from '@/models/lecturer';
import { deleteLecturer } from '@/services/lecturer-service';
import { colors, radius, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/firebase-errors';

function LecturerCard({
  lecturer,
  deleting,
  onDelete,
}: {
  lecturer: Lecturer;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.lecturerRow}>
        <LecturerAvatar fullname={lecturer.Fullname} size={58} uri={lecturer.Image} />
        <View style={styles.lecturerInfo}>
          <Text numberOfLines={1} style={styles.fullname}>{lecturer.Fullname}</Text>
          <Text numberOfLines={1} style={styles.lecturerId}>Mã giảng viên: {lecturer.IDGV}</Text>
          <Text style={styles.sumClass}>Tổng số lớp: {lecturer.SumClass}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <IconButton
          backgroundColor={colors.primarySoft}
          color={colors.primary}
          icon="eye-outline"
          label={`Xem ${lecturer.Fullname}`}
          onPress={() => router.push({ pathname: '/lecturer-detail', params: { id: lecturer.id } })}
        />
        <IconButton
          icon="create-outline"
          label={`Sửa ${lecturer.Fullname}`}
          onPress={() => router.push({ pathname: '/lecturer-form', params: { id: lecturer.id } })}
        />
        <IconButton
          backgroundColor={colors.dangerSoft}
          color={colors.danger}
          disabled={deleting}
          icon="trash-outline"
          label={`Xóa ${lecturer.Fullname}`}
          onPress={onDelete}
        />
        {deleting ? <ActivityIndicator color={colors.danger} size="small" /> : null}
      </View>
    </View>
  );
}

export default function LecturersScreen() {
  const { lecturers, loading, refreshing, error, refresh } = useLecturers();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const filteredLecturers = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('vi');
    if (!normalized) return lecturers;
    return lecturers.filter(
      (lecturer) =>
        lecturer.IDGV.toLocaleLowerCase('vi').includes(normalized) ||
        lecturer.Fullname.toLocaleLowerCase('vi').includes(normalized),
    );
  }, [lecturers, search]);

  function confirmDelete(lecturer: Lecturer) {
    Alert.alert(
      'Xóa giảng viên?',
      `${lecturer.IDGV} — ${lecturer.Fullname} sẽ bị xóa khỏi collection GiangVien.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(lecturer.id);
            try {
              await deleteLecturer(lecturer.id);
              Alert.alert('Đã xóa', 'Giảng viên đã được xóa khỏi Firestore.');
            } catch (nextError) {
              Alert.alert('Không thể xóa', getErrorMessage(nextError));
            } finally {
              setDeletingId('');
            }
          },
        },
      ],
    );
  }

  return (
    <AdminGate>
      <AppScreen
        right={
          <PrimaryButton
            compact
            icon="person-add-outline"
            label="Thêm"
            onPress={() => router.push('/lecturer-form')}
          />
        }
        subtitle={`${lecturers.length} giảng viên trong collection GiangVien`}
        title="Danh sách giảng viên">
        <View style={styles.toolbar}>
          <IconButton icon="arrow-back" label="Quay lại Dashboard" onPress={() => router.back()} />
          <View style={styles.searchBox}>
            <Ionicons color={colors.textMuted} name="search-outline" size={20} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearch}
              placeholder="Tìm IDGV hoặc họ tên"
              placeholderTextColor="#98A2B3"
              style={styles.searchInput}
              value={search}
            />
            {search ? (
              <IconButton
                backgroundColor="transparent"
                icon="close-circle"
                label="Xóa tìm kiếm"
                onPress={() => setSearch('')}
                style={styles.clearButton}
              />
            ) : null}
          </View>
        </View>

        {loading ? (
          <LoadingView label="Đang tải giảng viên từ Firestore..." />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredLecturers}
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
              ) : search ? (
                <StateView
                  icon="search-outline"
                  message="Hãy thử một mã giảng viên hoặc họ tên khác."
                  title="Không tìm thấy kết quả"
                />
              ) : (
                <StateView
                  actionLabel="Thêm giảng viên"
                  message="Thêm giảng viên đầu tiên vào collection GiangVien."
                  onAction={() => router.push('/lecturer-form')}
                  title="Danh sách đang trống"
                />
              )
            }
            refreshControl={
              <RefreshControl
                colors={[colors.primary]}
                onRefresh={refresh}
                refreshing={refreshing}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <LecturerCard
                deleting={deletingId === item.id}
                lecturer={item}
                onDelete={() => confirmDelete(item)}
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
  lecturerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.medium },
  lecturerInfo: { flex: 1, gap: 3 },
  fullname: { color: colors.text, fontSize: 17, fontWeight: '800' },
  lecturerId: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  sumClass: { color: colors.textMuted, fontSize: 13 },
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
