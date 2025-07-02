import pTimeout from 'p-timeout';

// wapper for pTimeout

export interface ClearablePromise<T> extends Promise<T> {
  /**
  Clear the timeout.
  */
  clear: () => void;
}

export function pto<T>(promise: Promise<T>, timeoutMs: number, msg?: string): ClearablePromise<T> {
  // p-timeout@6
  //return pTimeout(promise, {
  //  milliseconds: timeoutMs,
  //  message: Error(msg || `promise Timeout after ${timeoutMs} ms`),
  //});
  // return pTimeout(promise, timeoutMs, Error(msg || `promise Timeout after ${timeoutMs} ms`));
  return pTimeout(promise, {
    message: Error(msg || `promise Timeout after ${timeoutMs} ms`),
    milliseconds: timeoutMs,
  });
}

export default pto;
