import * as fs from 'fs'
import * as os from 'os'
import path from 'path'
import {APPLICATION_NAME} from '../application-constants'

export function cleanUrl(url: string): string {
  if (url && url.endsWith('/')) {
    return url.slice(0, url.length - 1)
  }
  return url
}

export function createTempDir(): string {
  const appPrefix = APPLICATION_NAME
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix))

  return tempDir
}

export function cleanupTempDir(tempDir: string): void {
  if (tempDir) {
    fs.rmSync(tempDir, {recursive: true})
  }
}
