/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import type { Role } from "./types";
import { authStore } from "./authStore";

type AuthState = {
  isAuthed: boolean;
  role: Role | null;
  userId: string | null;
  setSession: (input: { accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
};

// ✅ export the context so the hook can live in a separate file
export const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  const isAuthed = Boolean(
    authStore.getAccessToken() && authStore.getRefreshToken(),
  );

  const setSession = React.useCallback(
    (input: { accessToken: string; refreshToken: string }) => {
      authStore.setTokens(input);
    },
    [],
  );

  const clearSession = React.useCallback(() => {
    authStore.clear();
    setRole(null);
    setUserId(null);
  }, []);

  const value: AuthState = { isAuthed, role, userId, setSession, clearSession };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
