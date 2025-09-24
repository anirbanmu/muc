import { describe, it, expect, vi } from 'vitest';
import Limiter from '../limiter.js';

describe('Limiter', () => {
  it('runs functions immediately when under limit', async () => {
    const limiter = new Limiter(2);
    const fn = vi.fn().mockResolvedValue('result');

    const promise = limiter.run(fn);

    // function should be called immediately, before we await
    expect(fn).toHaveBeenCalledOnce();

    const result = await promise;
    expect(result).toBe('result');
  });

  it('queues functions when at limit', async () => {
    const limiter = new Limiter(1);
    let resolve1: (value: string) => void;
    let resolve2: (value: string) => void;

    const fn1 = vi.fn(
      () =>
        new Promise<string>(r => {
          resolve1 = r;
        }),
    );
    const fn2 = vi.fn(
      () =>
        new Promise<string>(r => {
          resolve2 = r;
        }),
    );

    const promise1 = limiter.run(fn1);
    const promise2 = limiter.run(fn2);

    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).not.toHaveBeenCalled();

    resolve1!('first');
    await promise1;

    expect(fn2).toHaveBeenCalledOnce();
    resolve2!('second');

    const result2 = await promise2;
    expect(result2).toBe('second');
  });

  it('handles errors properly', async () => {
    const limiter = new Limiter(1);
    const error = new Error('test error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(limiter.run(fn)).rejects.toThrow('test error');
  });
});
