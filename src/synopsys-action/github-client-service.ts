import {HttpClient} from 'typed-rest-client/HttpClient'
import * as inputs from './inputs'
import * as fs from 'fs'
import * as zlib from 'zlib'
import {checkIfPathExists, getDefaultSarifReportPath} from './utility'
import {debug, info, warning} from '@actions/core'
import {isNullOrEmptyValue} from './validators'
import {GITHUB_ENVIRONMENT_VARIABLES} from '../application-constants'
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
      throw new Error('Missing required GitHub token for uploading SARIF result to advance security')
    }
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
        const httpClient = new HttpClient('GithubClientService')
        const httpResponse = await httpClient.post(endpoint, JSON.stringify(data), {
          Authorization: `Bearer ${this.githubToken}`,
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
