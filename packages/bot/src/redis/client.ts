// In-memory key-value store (replaces Redis)
const store = new Map<string, { value: string; expiresAt: number }>();

// Cleanup expired keys every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

export const redis = {
  async get(key: string): Promise<string | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key: string, value: string, _ex?: string, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || 86400) * 1000;
    store.set(key, { value, expiresAt });
  },

  async del(key: string): Promise<void> {
    store.delete(key);
  },
};
