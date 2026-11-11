import { useCallback, useEffect, useState } from 'react';

import { ManagedUser } from '@/models/user';
import { fetchUsers, subscribeToUsers } from '@/services/user-service';
import { getErrorMessage } from '@/utils/firebase-errors';

export function useUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToUsers(
      (nextUsers) => {
        setUsers(nextUsers);
        setError('');
        setLoading(false);
      },
      (nextError) => {
        setError(getErrorMessage(nextError));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setUsers(await fetchUsers());
      setError('');
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { users, loading, refreshing, error, refresh };
}
