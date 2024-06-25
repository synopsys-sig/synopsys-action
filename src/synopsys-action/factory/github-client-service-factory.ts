import {IGithubClientService} from '../service/i-github-client-service'
import {GithubClientServiceV1} from '../service/impl/v1/github-client-service-v1'
import {GithubClientServiceV2} from '../service/impl/v2/github-client-service-v2'
import {info} from '@actions/core'

export const GitHubClientServiceFactory = {
  SUPPORTED_VERSIONS_V1: ['3.11', '3.12'],

  async fetchVersion(): Promise<string> {
    // Logic to fetch version from GitHub API
    return '3.12'
  },

  async getGitHubClientServiceInstance(): Promise<IGithubClientService> {
    const version = await this.fetchVersion()
    let service: IGithubClientService

    if (this.SUPPORTED_VERSIONS_V1.includes(version)) {
      info(`Using GitHub API v1 for version ${version}`)
      service = new GithubClientServiceV1()
    } else if (this.SUPPORTED_VERSIONS_V1.includes(version)) {
      info(`Using GitHub API v2 for version ${version}`)
      service = new GithubClientServiceV2()
    } else {
      info(`Using GitHub API v2 for version ${version}`)
      service = new GithubClientServiceV2()
    }
    return service
  }
}
