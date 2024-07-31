import * as fs from 'fs'
import * as os from 'os'
import path from 'path'
import {APPLICATION_NAME, GITHUB_ENVIRONMENT_VARIABLES} from '../application-constants'
import {rmRF} from '@actions/io'
import {getGitHubWorkspaceDir} from 'actions-artifact-v2/lib/internal/shared/config'
import * as constants from '../application-constants'
import {debug} from '@actions/core'

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

export function getDefaultSarifReportPath(sarifReportDirectory: string, appendFilePath: boolean): string {
  const pwd = getGitHubWorkspaceDir()
  return !appendFilePath ? path.join(pwd, constants.BRIDGE_LOCAL_DIRECTORY, sarifReportDirectory) : path.join(pwd, constants.BRIDGE_LOCAL_DIRECTORY, sarifReportDirectory, constants.SARIF_DEFAULT_FILE_NAME)
}

export function isPullRequestEvent(): boolean {
  const eventName = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_EVENT_NAME] || ''
  debug(`Github Event Name: ${eventName}`)
  return eventName === 'pull_request' || false
}

export function isGitHubCloud(): boolean {
  const githubServerUrl = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SERVER_URL] || ''
  return githubServerUrl === constants.GITHUB_CLOUD_URL
}
