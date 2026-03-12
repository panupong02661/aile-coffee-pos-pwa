export interface StorageScopeOverride {
  userId?: string | null;
  shopId?: string | null;
}

const CURRENT_USER_KEY = 'currentUser';
const ACTIVE_SHOP_KEY = 'active_shop_id';

const safeParseUser = (): { id?: string } | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const buildScopedStorageKey = (baseKey: string, override?: StorageScopeOverride) => {
  if (typeof window === 'undefined') {
    return `${baseKey}:guest:no-shop`;
  }

  const parsedUser = safeParseUser();
  const userId = override?.userId ?? parsedUser?.id ?? 'guest';
  const shopId = override?.shopId ?? localStorage.getItem(ACTIVE_SHOP_KEY) ?? 'no-shop';

  return `${baseKey}:${userId}:${shopId}`;
};
