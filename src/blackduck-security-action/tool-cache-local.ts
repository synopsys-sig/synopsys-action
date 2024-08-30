import {RetryHelper} from './retry-helper'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as fs from 'fs'
import * as path from 'path'
import * as httpm from '@actions/http-client'

import * as stream from 'stream'
import * as util from 'util'

import {OutgoingHttpHeaders} from 'http'
import {v4 as uuidv4} from 'uuid'
import os from 'os'
import {NON_RETRY_HTTP_CODES, RETRY_COUNT, RETRY_DELAY_IN_MILLISECONDS} from '../application-constants'

export class HTTPError extends Error {
  constructor(readonly httpStatusCode: number | undefined) {
    super(`Unexpected HTTP response: ${httpStatusCode}`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

const userAgent = 'actions/tool-cache'

/**
 * Download a tool from an url and stream it into a file
 *
 * @param url       url of tool to download
 * @param dest      path to download tool
 * @param auth      authorization header
 * @param headers   other headers
 * @returns         path to downloaded tool
 */
export async function downloadTool(url: string, dest?: string, auth?: string, headers?: OutgoingHttpHeaders): Promise<string> {
  dest = dest || path.join(os.tmpdir(), uuidv4())
  await io.mkdirP(path.dirname(dest))
  core.debug(`Downloading ${url}`)
  core.debug(`Destination ${dest}`)

  const retryHelper = new RetryHelper(RETRY_COUNT, RETRY_DELAY_IN_MILLISECONDS)
  return await retryHelper.execute(
    async () => {
      return await downloadToolAttempt(url, dest || '', auth, headers)
    },
    (err: Error) => {
      if (err instanceof HTTPError && err.httpStatusCode) {
        if (!NON_RETRY_HTTP_CODES.has(Number(err.httpStatusCode))) {
          return true
        }
      } else if (!err.message.includes('Destination file path')) {
        return true
      }
      // Otherwise retry
      return false
    }
  )
}

async function downloadToolAttempt(url: string, dest: string, auth?: string, headers?: OutgoingHttpHeaders): Promise<string> {
  if (fs.existsSync(dest)) {
    throw new Error(`Destination file path ${dest} already exists`)
  }

  // Get the response headers
  const http = new httpm.HttpClient(userAgent, [], {
    allowRetries: false
  })

  if (auth) {
    core.debug('set auth')
    if (headers === undefined) {
      headers = {}
    }
    headers.authorization = auth
  }

  const response: httpm.HttpClientResponse = await http.get(url, headers)
  if (response.message.statusCode !== 200) {
    const err = new HTTPError(response.message.statusCode)
    core.debug(`Failed to download from "${url}". Code(${response.message.statusCode}) Message(${response.message.statusMessage})`)
    throw err
  }

  // Download the response body
  const pipeline = util.promisify(stream.pipeline)
  const responseMessageFactory = _getGlobal<() => stream.Readable>('TEST_DOWNLOAD_TOOL_RESPONSE_MESSAGE_FACTORY', () => response.message)
  const readStream = responseMessageFactory()
  let succeeded = false
  try {
    await pipeline(readStream, fs.createWriteStream(dest))
    core.debug('download complete')
    succeeded = true
    return dest
  } finally {
    // Error, delete dest before retry
    if (!succeeded) {
      core.debug('download failed')
      try {
        await io.rmRF(dest)
      } catch (err) {
        core.debug(`Failed to delete '${dest}'. ${err}`)
      }
    }
  }
}

function _getGlobal<T>(key: string, defaultValue: T): T {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const value = (global as any)[key] as T | undefined
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return value !== undefined ? value : defaultValue
}
