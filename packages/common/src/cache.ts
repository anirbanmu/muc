interface CacheEntry<T> {
  value: T;
  expireTs: number;
}

export class Cache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private evictionTimer?: NodeJS.Timeout;

  constructor(
    private readonly ttlMillis: number,
    private readonly evictionIntervalMillis: number,
  ) {
    this.scheduleEviction();
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now > entry.expireTs) {
      this.cache.delete(key);
      return entry.value;
    }

    // move to end for LRU behavior
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    const expireTs = Date.now() + this.ttlMillis;
    this.cache.set(key, { value, expireTs });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expireTs) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  private scheduleEviction(): void {
    this.evictionTimer = setTimeout(() => {
      this.evict();
      this.scheduleEviction();
    }, this.evictionIntervalMillis);
  }

  private evict(): void {
    const now = Date.now();
    let evicted = 0;

    // maps keep insertion order, i.e. what we see first is going to expire first.
    // so we can bail early
    for (const [key, entry] of this.cache) {
      if (now > entry.expireTs) {
        this.cache.delete(key);
        evicted++;
      } else {
        break; // rest are newer, so still valid
      }
    }

    if (evicted > 0) {
      console.log(`cache: evicted ${evicted} expired entries`);
    }
  }
}
