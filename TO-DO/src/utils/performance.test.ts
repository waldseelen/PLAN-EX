import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle, memoize, measurePerformance } from './performance';

describe('Performance Utilities', () => {
    describe('throttle', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should throttle function calls', () => {
            const func = vi.fn();
            const throttledFunc = throttle(func, 1000);

            throttledFunc();
            throttledFunc();
            throttledFunc();

            expect(func).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(1000);

            throttledFunc();
            expect(func).toHaveBeenCalledTimes(2);
        });

        it('should pass arguments to the throttled function', () => {
            const func = vi.fn();
            const throttledFunc = throttle(func, 1000);

            throttledFunc('arg1', 'arg2');
            expect(func).toHaveBeenCalledWith('arg1', 'arg2');
        });
    });

    describe('memoize', () => {
        it('should cache results for same arguments', () => {
            const func = vi.fn((a: number, b: number) => a + b);
            const memoizedFunc = memoize(func);

            expect(memoizedFunc(2, 3)).toBe(5);
            expect(func).toHaveBeenCalledTimes(1);

            expect(memoizedFunc(2, 3)).toBe(5);
            expect(func).toHaveBeenCalledTimes(1); // Should assume cached

            expect(memoizedFunc(3, 3)).toBe(6);
            expect(func).toHaveBeenCalledTimes(2);
        });

        it('should handle different argument types', () => {
            const func = vi.fn((a: string) => a.toUpperCase());
            const memoizedFunc = memoize(func);

            expect(memoizedFunc('hello')).toBe('HELLO');
            expect(memoizedFunc('hello')).toBe('HELLO');
            expect(func).toHaveBeenCalledTimes(1);
        });
    });

    describe('measurePerformance', () => {
        it('should execute the function and log performance', () => {
            const consoleSpy = vi.spyOn(console, 'log');
            const func = vi.fn();

            measurePerformance('Test Label', func);

            expect(func).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[Performance\] Test Label:/));

            consoleSpy.mockRestore();
        });
    });
});
