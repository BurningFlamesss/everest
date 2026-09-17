import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouteContext } from "@tanstack/react-router";
import type { Actor, AppUser } from "@/types";
import { can as hasPermission, type Permission } from "@/lib/permissions";
import { authClient } from "#/packages/auth/auth-client.ts";

interface AuthContextValue {
  user: AppUser | null;
  actor: Actor;
  loading: boolean;
  signOut: () => void;
  can: (permission: Permission) => boolean;
}

const FALLBACK_ACTOR: Actor = { id: "anonymous", name: "System", role: "staff" };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use Better Auth's reactive client hook directly!
  const { data, isPending } = authClient.useSession();
  const context = useRouteContext({ strict: false }) as any;
  
  // Prefer the reactive client session. If loading or missing, fall back to the SSR context
  const sessionUser = data?.user || context?.session?.user;

  const user: AppUser | null = sessionUser ? {
    id: sessionUser.id,
    name: sessionUser.name || (sessionUser.email ? sessionUser.email.split("@")[0].replace(/[._-]/g, " ") : "Admin"),
    email: sessionUser.email,
    role: (sessionUser as any).role || "super_admin",
    avatarUrl: sessionUser.image || (sessionUser.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sessionUser.email)}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"),
    title: (sessionUser as any).title || "Administrator",
  } : null;

  const signOut = useCallback(async () => {
    document.cookie = "scms_demo_session=; path=/; max-age=0;";
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      actor: user ? { id: user.id, name: user.name, role: user.role } : FALLBACK_ACTOR,
      loading: isPending,
      signOut,
      can: (permission: Permission) => hasPermission(user?.role, permission),
    }),
    [user, signOut, isPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
