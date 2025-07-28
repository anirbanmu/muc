import NodeCache from 'node-cache';

export class CacheAccessor<T> {
  constructor(
    private readonly cache: NodeCache,
    private readonly keyPrefix: string,
  ) {}

  public get(key: string): T | undefined {
    return this.cache.get<T>(`${this.keyPrefix}:${key}`);
  }

  public set(key: string, value: T): void {
    this.cache.set(`${this.keyPrefix}:${key}`, value);
  }

  public has(key: string): boolean {
    return this.cache.has(`${this.keyPrefix}:${key}`);
  }

  public delete(key: string): void {
    this.cache.del(`${this.keyPrefix}:${key}`);
  }
}
