import * as core from '@actions/core'
import {sleep} from './utility'

/**
 * Internal class for retries
 */
export class RetryHelper {
  private readonly maxAttempts: number
  private retryDelay: number

  constructor(maxAttempts: number, retryDelay: number) {
    if (maxAttempts < 1) {
      throw new Error('max attempts should be greater than or equal to 1')
    }
    this.maxAttempts = maxAttempts
    this.retryDelay = retryDelay
  }

  async execute<T>(action: () => Promise<T>, isRetryable?: (e: Error) => boolean): Promise<T> {
    let attempt = 1
    while (attempt <= this.maxAttempts) {
      // Try
      try {
        return await action()
      } catch (err) {
        if (isRetryable && !isRetryable(err as Error)) {
          throw err
        }
        core.info((err as Error).message)
      }

      core.info(
        'Synopsys Bridge download has been failed, Retries left: '
          .concat(String(this.maxAttempts - attempt + 1))
          .concat(', Waiting: ')
          .concat(String(this.retryDelay / 1000))
          .concat(' Seconds')
      )
      // Sleep
      await sleep(this.retryDelay)
      // Delayed exponentially starting from 15 seconds
      this.retryDelay = this.retryDelay * 2
      attempt++
    }

    // Last attempt
    return await action()
  }
}
