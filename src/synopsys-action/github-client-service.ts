import {HttpClient} from 'typed-rest-client/HttpClient'
import * as inputs from './inputs'
import * as fs from 'fs'
import * as zlib from 'zlib'
import {checkIfPathExists, getDefaultSarifReportPath, sleep} from './utility'
import {debug, info} from '@actions/core'
import {isNullOrEmptyValue} from './validators'
import {GITHUB_ENVIRONMENT_VARIABLES, RETRY_COUNT, RETRY_DELAY_IN_MILLISECONDS} from '../application-constants'
import * as constants from '../application-constants'

export class GithubClientService {
  gitHubCodeScanningUrl: string
  githubToken: string
  githubRepo: string
  repoName: string
  repoOwner: string
  githubServerUrl: string
  githubApiURL: string
  commit_sha: string
  githubRef: string

  constructor() {
    this.gitHubCodeScanningUrl = '/repos/{0}/{1}/code-scanning/sarifs'
    this.githubToken = inputs.GITHUB_TOKEN
    this.githubRepo = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY] || ''
    this.repoName = this.githubRepo !== '' ? this.githubRepo.substring(this.githubRepo.indexOf('/') + 1, this.githubRepo.length).trim() : ''
    this.repoOwner = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY_OWNER] || ''
    this.githubServerUrl = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SERVER_URL] || ''
    this.githubApiURL = this.githubServerUrl === constants.GITHUB_CLOUD_URL ? constants.GITHUB_CLOUD_API_URL : this.githubServerUrl
    this.commit_sha = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SHA] || ''
    this.githubRef = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF] || ''
  }

  async uploadSarifReport(defaultSarifReportDirectory: string, userSarifFilePath: string): Promise<void> {
    info('Uploading SARIF results to GitHub')
    if (isNullOrEmptyValue(inputs.GITHUB_TOKEN)) {
      throw new Error('Missing required GitHub token for uploading SARIF report to GitHub Advanced Security')
    }
    let retryCountLocal = RETRY_COUNT
    let retryDelay = RETRY_DELAY_IN_MILLISECONDS
    const stringFormat = (url: string, ...args: string[]): string => {
      return url.replace(/{(\d+)}/g, (match, index) => args[index] || '')
    }
    const endpoint = stringFormat(this.githubApiURL.concat(this.gitHubCodeScanningUrl), this.repoOwner, this.repoName)
    const sarifFilePath = userSarifFilePath ? userSarifFilePath : getDefaultSarifReportPath(defaultSarifReportDirectory, true)

    if (checkIfPathExists(sarifFilePath)) {
      try {
        const sarifContent = fs.readFileSync(sarifFilePath, 'utf8')
        const compressedSarif = zlib.gzipSync(sarifContent)
        const base64Sarif = compressedSarif.toString('base64')
        const data = {
          commit_sha: this.commit_sha,
          ref: this.githubRef,
          sarif: base64Sarif,
          validate: true
        }
        do {
          const httpClient = new HttpClient('GithubClientService')
          const httpResponse = await httpClient.post(endpoint, JSON.stringify(data), {
            Authorization: `Bearer ${this.githubToken}`,
            Accept: 'application/vnd.github+json'
          })
          debug(`HTTP Status Code: ${httpResponse.message.statusCode}`)
          debug(`HTTP Response Headers: ${JSON.stringify(httpResponse.message.headers)}`)
          const responseBody = await httpResponse.readBody()
          const rateLimitRemaining = httpResponse.message?.headers['x-ratelimit-remaining'] || ''
          if (httpResponse.message.statusCode === 202) {
            info('SARIF result uploaded successfully to GitHub Advance Security')
            retryCountLocal = 0
          } else if (httpResponse.message.statusCode === 403 && (rateLimitRemaining === '0' || responseBody.includes('secondary rate limit'))) {
            retryDelay = await this.retrySleepHelper('Uploading SARIF report to GitHub Advanced Security has been failed due to rate limit, Retries left: ', retryCountLocal, retryDelay)
            if (retryCountLocal === 1) {
              const rateLimitReset = httpResponse.message?.headers['x-ratelimit-reset'] || ''
              info(`Rate limit reset time is: ${rateLimitReset}`)
            }
            retryCountLocal--
          } else {
            retryCountLocal = 0
            throw new Error(responseBody)
          }
        } while (retryCountLocal > 0)
      } catch (error) {
        throw new Error(`Uploading SARIF report to GitHub Advanced Security failed: ${error}`)
      }
    } else {
      throw new Error('No SARIF file found to upload')
    }
  }

  private async retrySleepHelper(message: string, retryCountLocal: number, retryDelay: number): Promise<number> {
    info(
      message
        .concat(String(retryCountLocal))
        .concat(', Waiting: ')
        .concat(String(retryDelay / 1000))
        .concat(' Seconds')
    )
    await sleep(retryDelay)
    // Delayed exponentially starting from 15 seconds
    retryDelay = retryDelay * 2
    return retryDelay
  }
}
