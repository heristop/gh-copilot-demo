import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withRetry } from '../utils/retry'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should return result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    
    const promise = withRetry(fn)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce('success')
    
    const promise = withRetry(fn)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should throw error after max attempts', async () => {
    const error = new Error('Always fails')
    const fn = vi.fn().mockRejectedValue(error)
    
    const promise = withRetry(fn, { maxAttempts: 3 })
    
    await expect(async () => {
      await vi.runAllTimersAsync()
      await promise
    }).rejects.toThrow('Always fails')
    
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success')
    
    const promise = withRetry(fn, {
      initialDelay: 1000,
      backoffFactor: 2
    })

    // First attempt fails immediately
    await vi.advanceTimersByTimeAsync(0)
    
    // Wait for first retry (1000ms)
    await vi.advanceTimersByTimeAsync(1000)
    
    // Wait for second retry (2000ms)
    await vi.advanceTimersByTimeAsync(2000)
    
    const result = await promise
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should respect maxDelay', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success')
    
    const promise = withRetry(fn, {
      initialDelay: 5000,
      backoffFactor: 3,
      maxDelay: 8000
    })

    // First attempt fails
    await vi.advanceTimersByTimeAsync(0)
    
    // First retry delay: 5000ms
    await vi.advanceTimersByTimeAsync(5000)
    
    // Second retry delay should be 15000ms but capped at 8000ms
    await vi.advanceTimersByTimeAsync(8000)
    
    const result = await promise
    expect(result).toBe('success')
  })

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn()
    const error = new Error('Test error')
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success')
    
    const promise = withRetry(fn, { onRetry })
    await vi.runAllTimersAsync()
    await promise

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(1, error)
  })

  it('should work with custom maxAttempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'))
    
    const promise = withRetry(fn, { maxAttempts: 5 })
    
    await expect(async () => {
      await vi.runAllTimersAsync()
      await promise
    }).rejects.toThrow('Always fails')
    
    expect(fn).toHaveBeenCalledTimes(5)
  })

  it('should handle non-Error objects', async () => {
    const fn = vi.fn().mockRejectedValue('String error')
    
    const promise = withRetry(fn, { maxAttempts: 2 })
    
    await expect(async () => {
      await vi.runAllTimersAsync()
      await promise
    }).rejects.toThrow('String error')
  })
})
