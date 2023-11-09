import {HttpClient} from 'typed-rest-client/HttpClient'
import * as inputs from './inputs'
import {FIXPR_ENVIRONMENT_VARIABLES} from './input-data/blackduck'
import * as fs from 'fs'
import * as zlib from 'zlib'
import {checkIfPathExists, getDefaultSarifReportPath} from './utility'
import {debug, info, warning} from '@actions/core'
import {isNullOrEmptyValue} from './validators'

export class GithubClientService {
  gitHubCodeScanningUrl: string
  constructor() {
    this.gitHubCodeScanningUrl = '/repos/{0}/{1}/code-scanning/sarifs'
  }

  async uploadSarifReport(): Promise<void> {
    info('Uploading SARIF results to GitHub')
    if (isNullOrEmptyValue(inputs.GITHUB_TOKEN)) {
      throw new Error('Missing required GitHub token for uploading SARIF result to advance security')
    }
    const githubToken = inputs.GITHUB_TOKEN.trim()
    const githubRepo = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY]
    const repoName = githubRepo !== undefined ? githubRepo.substring(githubRepo.indexOf('/') + 1, githubRepo.length).trim() : ''
    const repoOwner = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY_OWNER] || ''
    const githubApiURL = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_API_URL] || ''
    const commit_sha = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_SHA] || ''
    const githubRef = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REF] || ''
    const stringFormat = (url: string, ...args: string[]): string => {
      return url.replace(/{(\d+)}/g, (match, index) => args[index] || '')
    }
    const endpoint = stringFormat(githubApiURL.concat(this.gitHubCodeScanningUrl), repoOwner, repoName)
    const sarifFilePath = inputs.REPORTS_SARIF_FILE_PATH.trim() ? inputs.REPORTS_SARIF_FILE_PATH.trim() : getDefaultSarifReportPath(true)
    if (checkIfPathExists(sarifFilePath)) {
      try {
        const sarifContent = fs.readFileSync(sarifFilePath, 'utf8')
        const compressedSarif = zlib.gzipSync(sarifContent)
        const base64Sarif = compressedSarif.toString('base64')
        const data = {
          commit_sha,
          ref: githubRef,
          sarif: base64Sarif,
          validate: true
        }
        const httpClient = new HttpClient('GithubClientService')
        const httpResponse = await httpClient.post(endpoint, JSON.stringify(data), {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json'
        })
        debug(`HTTP Status Code: ${httpResponse.message.statusCode}`)
        if (httpResponse.message.statusCode === 202) {
          info('SARIF result uploaded successfully to GitHub Advance Security')
        } else {
          warning('Error uploading SARIF data to GitHub Advance Security')
        }
      } catch (error) {
        throw new Error(`Error uploading SARIF data to GitHub Advance Security: ${error}`)
      }
    } else {
      throw new Error('No SARIF file found to upload')
    }
  }
}
