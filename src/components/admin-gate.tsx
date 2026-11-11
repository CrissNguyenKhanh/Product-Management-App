import { Redirect } from 'expo-router';
import { PropsWithChildren } from 'react';

import { LoadingView } from '@/components/loading-view';
import { useAuth } from '@/contexts/auth-context';

export function AdminGate({ children }: PropsWithChildren) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingView label="Đang xác thực phiên Admin..." />;
  if (!user || !isAdmin) return <Redirect href="/login" />;

  return children;
}
