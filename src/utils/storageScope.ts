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

const hasOwn = (target: object | undefined, key: string) =>
  !!target && Object.prototype.hasOwnProperty.call(target, key);

export const buildScopedStorageKey = (baseKey: string, override?: StorageScopeOverride) => {
  if (typeof window === 'undefined') {
    return `${baseKey}:guest:no-shop`;
  }

  const parsedUser = safeParseUser();
  const hasUserOverride = hasOwn(override, 'userId');
  const hasShopOverride = hasOwn(override, 'shopId');

  const userId = hasUserOverride
    ? (override?.userId || 'guest')
    : (parsedUser?.id || 'guest');

  const shopId = hasShopOverride
    ? (override?.shopId || 'no-shop')
    : (localStorage.getItem(ACTIVE_SHOP_KEY) || 'no-shop');

  return `${baseKey}:${userId}:${shopId}`;
};
