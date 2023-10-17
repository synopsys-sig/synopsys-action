import * as fs from 'fs'
import * as os from 'os'
import path from 'path'
import {APPLICATION_NAME} from '../application-constants'
import {rmRF} from '@actions/io'

export function cleanUrl(url: string): string {
  if (url && url.endsWith('/')) {
    return url.slice(0, url.length - 1)
  }
  return url
}

export async function createTempDir(): Promise<string> {
  const appPrefix = APPLICATION_NAME
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix))

  return tempDir
}

export async function cleanupTempDir(tempDir: string): Promise<void> {
  if (tempDir && fs.existsSync(tempDir)) {
    await rmRF(tempDir)
  }
}

export function checkIfGithubHostedAndLinux(): boolean {
  return String(process.env['RUNNER_NAME']).includes('Hosted Agent') && (process.platform === 'linux' || process.platform === 'darwin')
}

export function parseToBoolean(value: string | boolean): boolean {
  if (value !== null && value !== '' && (value.toString().toLowerCase() === 'true' || value === true)) {
    return true
  }
  return false
}

export function isBoolean(value: string | boolean): boolean {
  if (value !== null && value !== '' && (value.toString().toLowerCase() === 'true' || value === true || value.toString().toLowerCase() === 'false' || value === false)) {
    return true
  }
  return false
}

export function checkIfPathExists(fileOrDirectoryPath: string): boolean {
  if (fileOrDirectoryPath && fs.existsSync(fileOrDirectoryPath.trim())) {
    return true
  }
  return false
}

export async function sleep(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}
