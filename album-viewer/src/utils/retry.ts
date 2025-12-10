/**
 * Configuration options for retry logic
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  onRetry: () => {},
};

/**
 * Calculates the delay for the next retry attempt using exponential backoff
 * @param attempt - The current attempt number (0-indexed)
 * @param options - Retry configuration options
 * @returns The delay in milliseconds
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = Math.min(
    options.initialDelay * Math.pow(options.backoffFactor, attempt),
    options.maxDelay
  );
  return delay;
}

/**
 * Executes an async function with retry logic and exponential backoff
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns A promise that resolves with the result or rejects after all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === config.maxAttempts - 1) {
        throw lastError;
      }

      // Call the retry callback
      config.onRetry(attempt + 1, lastError);

      // Wait before retrying
      const delay = calculateDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}
