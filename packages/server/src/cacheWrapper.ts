import NodeCache from 'node-cache';

export class CacheWrapper {
  private readonly cache: NodeCache;

  constructor(options?: NodeCache.Options) {
    this.cache = new NodeCache(options);
  }

  public getAccessor<V>(keyPrefix: string): CacheAccessor<V> {
    return new CacheAccessor<V>(this.cache, keyPrefix);
  }
}

export class CacheAccessor<V> {
  constructor(
    private readonly cache: NodeCache,
    private readonly keyPrefix: string,
  ) {}

  public get(key: string): V | undefined {
    return this.cache.get<V>(`${this.keyPrefix}:${key}`);
  }

  public set(key: string, value: V): void {
    this.cache.set(`${this.keyPrefix}:${key}`, value);
  }

  public has(key: string): boolean {
    return this.cache.has(`${this.keyPrefix}:${key}`);
  }

  public delete(key: string): void {
    this.cache.del(`${this.keyPrefix}:${key}`);
  }
}
