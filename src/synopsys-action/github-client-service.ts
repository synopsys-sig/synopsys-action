import {HttpClient} from 'typed-rest-client/HttpClient'
import * as inputs from './inputs'
import {FIXPR_ENVIRONMENT_VARIABLES} from './input-data/blackduck'
import * as fs from 'fs'
import * as zlib from 'zlib'
import {checkIfPathExists} from './utility'
import {UploadResponse} from '@actions/artifact/lib/internal/upload-response'
import * as artifact from '@actions/artifact'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {UploadOptions} from '@actions/artifact/lib/internal/upload-options'
import {info, warning} from '@actions/core'
import * as path from 'path'
import * as constants from '../application-constants'

export class GithubClientService {
  gitHubCodeScanningUrl: string
  constructor() {
    this.gitHubCodeScanningUrl = '/repos/{0}/{1}/code-scanning/sarifs'
  }

  async uploadSarifReport(): Promise<void> {
    info('Uploading SARIF results to GitHub')
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
    const sarifFilePath = inputs.REPORTS_SARIF_FILE_PATH.trim() ? inputs.REPORTS_SARIF_FILE_PATH.trim() : this.getDefaultSarifReportPath(true)
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
        info(`http status code:${httpResponse.message.statusCode}`)
        if (httpResponse.message.statusCode === 202) {
          await this.uploadSarifReportAsArtifact(sarifFilePath)
        } else {
          warning('Error uploading SARIF data to GitHub Advance Security')
        }
      } catch (error) {
        warning(`Error uploading SARIF data to GitHub Advance Security: ${error}`)
      }
    } else {
      warning('No SARIF file to upload')
    }
  }

  private async uploadSarifReportAsArtifact(sarifFilePath: string): Promise<UploadResponse | void> {
    const artifactClient = artifact.create()
    let rootDir = ''
    if (inputs.REPORTS_SARIF_FILE_PATH.trim()) {
      rootDir = path.dirname(sarifFilePath)
    } else {
      rootDir = this.getDefaultSarifReportPath(false)
    }
    info('rootDir: '.concat(rootDir))
    const options: UploadOptions = {}
    options.continueOnError = false
    return await artifactClient.uploadArtifact(constants.SARIF_UPLOAD_FOLDER_ARTIFACT_NAME, [sarifFilePath], rootDir, options)
  }

  private getDefaultSarifReportPath(appendFilePath: boolean): string {
    const pwd = getWorkSpaceDirectory()
    return !appendFilePath ? path.join(pwd, constants.BRIDGE_DIAGNOSTICS_FOLDER, constants.BRIDGE_SARIF_GENERATOR_FOLDER) : path.join(pwd, constants.BRIDGE_DIAGNOSTICS_FOLDER, constants.BRIDGE_SARIF_GENERATOR_FOLDER, constants.SARIF_DEFAULT_FILE_NAME)
  }
}
