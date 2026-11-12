import { useCallback, useEffect, useState } from 'react';

import { Lecturer } from '@/models/lecturer';
import { fetchLecturers, subscribeToLecturers } from '@/services/lecturer-service';
import { getErrorMessage } from '@/utils/firebase-errors';

export function useLecturers() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeToLecturers(
      (nextLecturers) => {
        setLecturers(nextLecturers);
        setError('');
        setLoading(false);
      },
      (nextError) => {
        setError(getErrorMessage(nextError));
        setLoading(false);
      },
    );
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setLecturers(await fetchLecturers());
      setError('');
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { lecturers, loading, refreshing, error, refresh };
}
