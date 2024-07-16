import {GithubClientServiceInterface} from '../service/github-client-service-interface'
import {GithubClientServiceCloud} from '../service/impl/cloud/github-client-service-cloud'
import {info} from '@actions/core'
import * as constants from '../../application-constants'
import {GithubClientServiceV1} from '../service/impl/enterprise/v1/github-client-service-v1'
import {GithubClientServiceV2} from '../service/impl/enterprise/v2/github-client-service-v2'
import {HttpClient} from 'typed-rest-client/HttpClient'
import * as inputs from '../inputs'

export const GitHubClientServiceFactory = {
  SUPPORTED_VERSIONS_V1: ['3.11', '3.12'],
  SUPPORTED_VERSIONS_V2: ['3.13', '3.14'],
  DEFAULT_VERSION: '3.12',

  async fetchVersion(githubServerUrl: string): Promise<string> {
    const githubEnterpriseMetaUrl = '/meta'
    const githubToken = inputs.GITHUB_TOKEN
    const endpoint = githubServerUrl.concat(githubEnterpriseMetaUrl)

    try {
      const httpClient = new HttpClient('GitHubClientServiceFactory')
      const httpResponse = await httpClient.get(endpoint, {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json'
      })

      if (httpResponse.message.statusCode === constants.HTTP_STATUS_OK) {
        const metaDataResponse = JSON.parse(await httpResponse.readBody())
        return metaDataResponse.installed_version
      } else {
        throw new Error(`No version info found for endpoint : ${endpoint}`)
      }
    } catch (error) {
      throw new Error(`Fetching version info for enterprise server failed : ${error}`)
    }
  },

  async getGitHubClientServiceInstance(): Promise<GithubClientServiceInterface> {
    info('Fetching GitHub client service instance...')
    const githubServerUrl = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SERVER_URL] || ''

    let service: GithubClientServiceInterface
    if (githubServerUrl === constants.GITHUB_CLOUD_URL) {
      service = new GithubClientServiceCloud()
    } else {
      const version = await this.fetchVersion(githubServerUrl)
      if (this.SUPPORTED_VERSIONS_V1.includes(version)) {
        info(`Using GitHub API v1 for version ${version}`)
        service = new GithubClientServiceV1()
      } else if (this.SUPPORTED_VERSIONS_V2.includes(version)) {
        info(`Using GitHub API v2 for version ${version}`)
        service = new GithubClientServiceV2()
      } else {
        info(`Using GitHub API v2 for version ${version}`)
        service = new GithubClientServiceV2()
      }
    }
    return service
  }
}
