import * as inputs from '../../../src/synopsys-action/inputs'
import {HttpClientResponse, HttpClient} from 'typed-rest-client/HttpClient'
import {IncomingMessage} from 'http'
import Mocked = jest.Mocked
import {GithubClientService} from '../../../src/synopsys-action/github-client-service'
import {Socket} from 'net'
import * as artifact from '@actions/artifact'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import any = jasmine.any
import {UploadResponse} from '@actions/artifact'

const originalEnv = process.env
beforeEach(() => {
  jest.resetModules()
  process.env = {
    ...originalEnv,
    GITHUB_REPOSITORY: 'test-repo',
    GITHUB_HEAD_REF: 'test-owner',
    GITHUB_REF: 'test-ref',
    GITHUB_API_URL: 'test-url',
    GITHUB_SHA: 'test-sha'
  }
  Object.defineProperty(process, 'platform', {value: 'linux'})
})

test('should upload sarif report successfully', () => {
  const githubClientService = new GithubClientService()

  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())
  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }
  httpResponse.message.statusCode = 202
  jest.spyOn(HttpClient.prototype, 'post').mockResolvedValueOnce(httpResponse)

  const mockUploadArtifact = jest.fn()
  const mockArtifactClient: Partial<artifact.ArtifactClient> = {
    uploadArtifact: mockUploadArtifact
  }
  const mockCreate = jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)
  const mockDir = jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('.')
  const mockPwd = './.bridge/SARIF Generator'
  const mockFiles = ['./.bridge/SARIF Generator/sarif_report.json']
  //jest.spyOn(mockArtifactClient, 'uploadArtifact')
  const uploadResponse = new Promise<UploadResponse>((resolve, reject) => {})
  jest.spyOn(mockArtifactClient, 'uploadArtifact').mockReturnValue(uploadResponse)

  const response = githubClientService.uploadSarifReport()
  //expect(mockUploadArtifact).toHaveBeenCalled()
  expect(response).resolves.toBeUndefined()
  mockCreate.mockRestore()
})

test('should not upload sarif report if it does not exist', () => {
  const githubClientService = new GithubClientService()

  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  Object.defineProperty(inputs, 'REPORTS_SARIF_FILE_PATH', {value: 'test' + ''})
  const response = githubClientService.uploadSarifReport()
  expect(response).resolves.toBeUndefined()
})

afterEach(() => {
  process.env = originalEnv
})
