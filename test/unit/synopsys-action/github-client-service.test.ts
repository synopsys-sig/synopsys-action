import * as inputs from '../../../src/synopsys-action/inputs'
import {HttpClientResponse, HttpClient} from 'typed-rest-client/HttpClient'
import {IncomingMessage} from 'http'
import Mocked = jest.Mocked
import {GithubClientService} from '../../../src/synopsys-action/github-client-service'
import {Socket} from 'net'
import * as artifact from '@actions/artifact'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import * as utility from '../../../src/synopsys-action/utility'
import fs from 'fs'
import * as zlib from 'zlib'

jest.mock('@actions/artifact')
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

describe('upload sarif', () => {
  it('should upload sarif report successfully with default location', async function () {
    const githubClientService = new GithubClientService()

    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    const mockCheckIfPathExists = jest.spyOn(utility, 'checkIfPathExists')
    mockCheckIfPathExists.mockReturnValue(true)
    const mockReadFileSync = jest.spyOn(fs, 'readFileSync')
    mockReadFileSync.mockReturnValue('test-content')

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
    jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('.')
    jest.spyOn(mockArtifactClient, 'uploadArtifact')

    const response = await githubClientService.uploadSarifReport()
    expect(mockUploadArtifact).toHaveBeenCalled()
    expect(mockUploadArtifact).toHaveBeenCalledWith('sarif_report', ['.bridge/SARIF Report Generator/sarif_report.json'], '.bridge/SARIF Report Generator', {continueOnError: false})
    expect(response).toBeUndefined()
    mockCreate.mockRestore()
  })

  it('should upload sarif report successfully with REPORTS_SARIF_FILE_PATH', async function () {
    const githubClientService = new GithubClientService()

    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    Object.defineProperty(inputs, 'REPORTS_SARIF_FILE_PATH', {value: 'test-path'})
    const mockCheckIfPathExists = jest.spyOn(utility, 'checkIfPathExists')
    mockCheckIfPathExists.mockReturnValue(true)
    const mockReadFileSync = jest.spyOn(fs, 'readFileSync')
    mockReadFileSync.mockReturnValue('test-content')

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
    jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('.')
    jest.spyOn(mockArtifactClient, 'uploadArtifact')

    const response = await githubClientService.uploadSarifReport()
    expect(mockUploadArtifact).toHaveBeenCalled()
    expect(mockUploadArtifact).toHaveBeenCalledWith('sarif_report', ['test-path'], '.', {continueOnError: false})
    expect(response).toBeUndefined()
    mockCreate.mockRestore()
  })

  it('should not upload sarif report if it does not exist', async function () {
    const githubClientService = new GithubClientService()

    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    Object.defineProperty(inputs, 'REPORTS_SARIF_FILE_PATH', {value: 'testpath'})
    const mockCheckIfPathExists = jest.spyOn(utility, 'checkIfPathExists')
    mockCheckIfPathExists.mockReturnValue(false)
    const response = await githubClientService.uploadSarifReport()
    expect(response).toBeUndefined()
  })
})

afterEach(() => {
  process.env = originalEnv
})
