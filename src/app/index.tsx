import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/loading-view';
import { useAuth } from '@/contexts/auth-context';

export default function IndexScreen() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingView label="Đang khởi động ứng dụng..." />;
  return <Redirect href={user && isAdmin ? '/dashboard' : '/login'} />;
}
