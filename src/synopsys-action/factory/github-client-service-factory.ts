import {GithubClientServiceInterface} from '../service/github-client-service-interface'
import {GithubClientServiceCloud} from '../service/impl/cloud/github-client-service-cloud'
import {debug, info} from '@actions/core'
import * as constants from '../../application-constants'
import {GithubClientServiceV1} from '../service/impl/enterprise/v1/github-client-service-v1'
import {HttpClient} from 'typed-rest-client/HttpClient'
import * as inputs from '../inputs'

export const GitHubClientServiceFactory = {
  DEFAULT_VERSION: '3.12',
  // V1 will have all currently supported versions
  // {V2, V3 ... Vn} will have breaking changes
  SUPPORTED_VERSIONS_V1: ['3.11', '3.12'],
  // Add new version here

  async fetchVersion(githubApiUrl: string): Promise<string> {
    const githubEnterpriseMetaUrl = '/meta'
    const githubToken = inputs.GITHUB_TOKEN
    const endpoint = githubApiUrl.concat(githubEnterpriseMetaUrl)

    try {
      const httpClient = new HttpClient('GitHubClientServiceFactory')
      const httpResponse = await httpClient.get(endpoint, {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json'
      })

      if (httpResponse.message.statusCode === constants.HTTP_STATUS_OK) {
        const metaDataResponse = JSON.parse(await httpResponse.readBody())
        const installedVersion = metaDataResponse.installed_version
        debug(`Installed version: ${installedVersion}`)
        return installedVersion
      } else {
        debug(`No version info found for endpoint : ${endpoint}. Default version: ${this.DEFAULT_VERSION} will be used.`)
      }
    } catch (error) {
      debug(`Fetching version info for enterprise server failed : ${error}. Default version: ${this.DEFAULT_VERSION} will be used.`)
    }
    return this.DEFAULT_VERSION
  },

  async getGitHubClientServiceInstance(): Promise<GithubClientServiceInterface> {
    info('Fetching GitHub client service instance...')
    const githubApiUrl = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_API_URL] || ''

    if (githubApiUrl === constants.GITHUB_CLOUD_API_URL) {
      debug(`Using GitHub client service Cloud instance`)
      return new GithubClientServiceCloud()
    } else {
      const version = await this.fetchVersion(githubApiUrl)
      const [major, minor] = version.split('.').slice(0, 2)
      const majorMinorVersion = major.concat('.').concat(minor)
      // When there is contract change use if-else/switch-case and handle v1/v2 based on supported versions
      if (this.SUPPORTED_VERSIONS_V1.includes(majorMinorVersion)) {
        info(`Using GitHub Enterprise Server API v1 for version ${version}`)
      } else {
        info(`GitHub Enterprise Server version ${version} is not supported, proceeding with default version ${this.DEFAULT_VERSION}`)
      }
      debug(`Using GitHub client service V1 instance`)
      return new GithubClientServiceV1()
    }
  }
}
