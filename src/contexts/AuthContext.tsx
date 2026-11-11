import { User, onIdTokenChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../config/firebase';

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
    let active = true;
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (active) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const token = await currentUser.getIdTokenResult();
        if (active) {
          setUser(currentUser);
          setIsAdmin(token.claims.admin === true);
        }
      } catch {
        if (active) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin,
      loading,
      login: async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const token = await credential.user.getIdTokenResult(true);
        if (token.claims.admin !== true) {
          await signOut(auth);
          throw new Error('Tài khoản này không có quyền Admin.');
        }
        setUser(credential.user);
        setIsAdmin(true);
      },
      logout: () => signOut(auth),
    }),
    [isAdmin, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  return value;
}
