import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import * as store from "@/lib/nabio/store";
import type { ProfileLink, UserProfile } from "@/lib/nabio/types";

// Hooks que consomem a camada de dados. Ao plugar o Supabase, estes hooks
// podem virar wrappers de useQuery/useMutation sem alterar os componentes.

function useStoreVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => store.subscribe(() => setVersion((v) => v + 1)) as () => void, []);
  return version;
}

/** Evita hydration mismatch: dados do localStorage só após montar. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useSession() {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const refresh = () => {
      setLoading(true);
      void store.loadSession().then((next) => {
        if (active) {
          setUser(next);
          setLoading(false);
        }
      });
    };
    refresh();
    const unsubscribe = store.onAuthChange(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [hydrated]);
  const currentUser = user ? store.getUserById(user.id) ?? user : null;
  void version;
  return { user: currentUser, loading: !hydrated || loading };
}

export function useLinks(userId?: string) {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  void version;
  useEffect(() => {
    if (userId && hydrated) void store.loadLinks(userId);
  }, [userId, hydrated]);
  return userId && hydrated ? store.getLinks(userId) : [];
}

export function useUsers() {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  void version;
  return hydrated ? store.getUsers() : [];
}

/** Carrega do Supabase todos os dados do painel admin (perfis, links, denúncias, logs). */
export function useAdminData(enabled: boolean) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    setError(null);
    store
      .loadAdminData()
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { loading, error, reload };
}

export function useReports() {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  void version;
  return hydrated ? store.getReports() : [];
}

export function useLogs() {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  void version;
  return hydrated ? store.getLogs() : [];
}


export function usePlatformStats() {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  void version;
  return hydrated
    ? store.getPlatformStats()
    : {
        totalUsers: 0,
        totalLinks: 0,
        totalClicks: 0,
        activeUsers: 0,
        openReports: 0,
        signupsByMonth: [] as { month: string; total: number }[],
      };
}

export function usePublicProfile(username: string) {
  const version = useStoreVersion();
  const hydrated = useHydrated();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    setLoading(true);
    void store.loadPublicProfile(username).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [username, hydrated]);
  void version;
  const user = hydrated ? store.getUserByUsername(username) : undefined;
  const links = user ? store.getLinks(user.id).filter((l) => l.active) : [];
  return { user: user ?? null, links, loading: !hydrated || loading };
}

export function useProfileActions(user: UserProfile | null) {
  const save = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (user) await store.updateUser(user.id, patch);
    },
    [user],
  );

  const addLink = useCallback(
    (input: Partial<ProfileLink>) => (user ? store.createLink(user.id, input) : Promise.resolve(null)),
    [user],
  );
  const reorder = useCallback(
    (ids: string[]) => {
      if (user) void store.reorderLinks(user.id, ids);
    },
    [user],
  );
  return {
    save,
    addLink,
    reorder,
    updateLink: store.updateLink,
    deleteLink: store.deleteLink,
  };
}

export const auth = {
  signIn: store.signIn,
  signUp: store.signUp,
  signOut: store.signOut,
  isUsernameAvailable: store.isUsernameAvailable,
};
