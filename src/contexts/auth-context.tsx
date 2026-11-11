import {
  User,
  getIdTokenResult,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '@/config/firebase';

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onIdTokenChanged(auth, async (nextUser) => {
      try {
        if (!nextUser) {
          setUser(null);
          setIsAdmin(false);
          return;
        }

        const token = await getIdTokenResult(nextUser);
        const hasAdminClaim = token.claims.admin === true;

        if (!hasAdminClaim) {
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          return;
        }

        setUser(nextUser);
        setIsAdmin(true);
      } catch {
        setUser(null);
        setIsAdmin(false);
        await signOut(auth).catch(() => undefined);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const token = await getIdTokenResult(credential.user, true);

    if (token.claims.admin !== true) {
      await signOut(auth);
      throw new Error('Tài khoản này không có quyền Admin.');
    }

    setUser(credential.user);
    setIsAdmin(true);
  }

  async function logout() {
    await signOut(auth);
  }

  const value = useMemo(
    () => ({ user, isAdmin, loading, login, logout }),
    [user, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  return value;
}
