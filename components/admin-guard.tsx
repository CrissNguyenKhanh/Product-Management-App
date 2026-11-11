import { Redirect } from 'expo-router';
import { PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { palette } from '../src/theme/appTheme';

export function AdminGuard({ children }: PropsWithChildren) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.primary} size="large" />
        <Text style={styles.loadingText}>Đang kiểm tra phiên đăng nhập...</Text>
      </View>
    );
  }

  if (!isAdmin) return <Redirect href="/login" />;
  return children;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: palette.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: { color: palette.textMuted, marginTop: 12 },
});
