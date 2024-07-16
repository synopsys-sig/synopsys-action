import * as inputs from '../../../../src/synopsys-action/inputs'
import {HttpClient, HttpClientResponse} from 'typed-rest-client/HttpClient'
import {GitHubClientServiceFactory} from '../../../../src/synopsys-action/factory/github-client-service-factory'
import {IncomingMessage} from 'http'
import {Socket} from 'net'
import Mocked = jest.Mocked
import {GithubClientServiceCloud} from '../../../../src/synopsys-action/service/impl/cloud/github-client-service-cloud'
import {GithubClientServiceV1} from '../../../../src/synopsys-action/service/impl/enterprise/v1/github-client-service-v1'
import {GithubClientServiceV2} from '../../../../src/synopsys-action/service/impl/enterprise/v2/github-client-service-v2'

describe('fetchVersion()', () => {
  beforeEach(() => {
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should fetch version successfully', async () => {
    const githubServerUrl = 'https://example.com'
    const expectedVersion = '3.12'
    const mockMetaDataResponse = JSON.stringify({installed_version: expectedVersion})

    const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())
    const httpResponse: Mocked<HttpClientResponse> = {
      message: incomingMessage,
      readBody: jest.fn()
    }
    httpResponse.readBody.mockResolvedValue(mockMetaDataResponse)
    httpResponse.message.statusCode = 200
    jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

    const version = await GitHubClientServiceFactory.fetchVersion(githubServerUrl)

    expect(version).toBe(expectedVersion)
  })

  it('should throw an error if the HTTP status is not OK', async () => {
    const githubServerUrl = 'https://example.com'
    const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())
    const httpResponse: Mocked<HttpClientResponse> = {
      message: incomingMessage,
      readBody: jest.fn()
    }
    httpResponse.message.statusCode = 404
    jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

    await expect(GitHubClientServiceFactory.fetchVersion(githubServerUrl)).rejects.toThrow(`No version info found for endpoint : ${githubServerUrl}/meta`)
  })

  it('should throw an error if fetching version fails', async () => {
    const githubServerUrl = 'https://example.com'
    const errorMessage = 'Network error'

    jest.spyOn(HttpClient.prototype, 'get').mockRejectedValue(new Error(errorMessage))

    await expect(GitHubClientServiceFactory.fetchVersion(githubServerUrl)).rejects.toThrow(`Fetching version info for enterprise server failed : Error: ${errorMessage}`)
  })
})

describe('getGitHubClientServiceInstance()', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return GithubClientServiceCloud service', async () => {
    process.env['GITHUB_SERVER_URL'] = 'https://github.com'

    expect(await GitHubClientServiceFactory.getGitHubClientServiceInstance()).toBeInstanceOf(GithubClientServiceCloud)
  })

  it('should return GithubClientServiceV1 service for version 3.12', async () => {
    process.env['GITHUB_SERVER_URL'] = 'https://example.com'
    jest.spyOn(GitHubClientServiceFactory, 'fetchVersion').mockResolvedValueOnce('3.12')

    expect(await GitHubClientServiceFactory.getGitHubClientServiceInstance()).toBeInstanceOf(GithubClientServiceV1)
  })

  it('should return GithubClientServiceV2 service for version 3.13', async () => {
    process.env['GITHUB_SERVER_URL'] = 'https://example.com'
    jest.spyOn(GitHubClientServiceFactory, 'fetchVersion').mockResolvedValueOnce('3.13')

    expect(await GitHubClientServiceFactory.getGitHubClientServiceInstance()).toBeInstanceOf(GithubClientServiceV2)
  })

  it('should return GithubClientServiceV2 service for unknown version', async () => {
    process.env['GITHUB_SERVER_URL'] = 'https://example.com'
    jest.spyOn(GitHubClientServiceFactory, 'fetchVersion').mockResolvedValueOnce('3.15')

    expect(await GitHubClientServiceFactory.getGitHubClientServiceInstance()).toBeInstanceOf(GithubClientServiceV2)
  })
})
