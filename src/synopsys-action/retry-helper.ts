import * as core from '@actions/core'
import {RETRY_DELAY} from '../application-constants'
import {sleep} from './utility'

/**
 * Internal class for retries
 */
export class RetryHelper {
  private readonly maxAttempts: number

  constructor(maxAttempts: number) {
    if (maxAttempts < 1) {
      throw new Error('max attempts should be greater than or equal to 1')
    }
    this.maxAttempts = maxAttempts
  }

  async execute<T>(action: () => Promise<T>, isRetryable?: (e: Error) => boolean): Promise<T> {
    let attempt = 1
    while (attempt < this.maxAttempts) {
      // Try
      try {
        return await action()
      } catch (err) {
        if (isRetryable && !isRetryable(err as Error)) {
          throw err
        }
        core.info((err as Error).message)
      }

      // Sleep
      core.info('Synopsys bridge download has been failed, retries left: '.concat(String(this.maxAttempts - attempt)))
      await sleep(RETRY_DELAY)
      attempt++
    }

    // Last attempt
    return await action()
  }
}
