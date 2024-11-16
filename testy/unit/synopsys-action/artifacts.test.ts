import * as configVariables from 'actions-artifact-v2/lib/internal/shared/config'
import {tmpdir} from 'os'
import {uploadDiagnostics, uploadSarifReportAsArtifact} from '../../../src/synopsys-action/artifacts'
import * as inputs from '../../../src/synopsys-action/inputs'
import * as artifact from 'actions-artifact-v2/lib/artifact'
const fs = require('fs')
import * as utility from '../../../src/synopsys-action/utility'

// Mock the artifact module
jest.mock('actions-artifact-v2', () => ({
  DefaultArtifactClient: jest.fn().mockImplementation(() => ({
    uploadArtifact: jest.fn(),
    downloadArtifact: jest.fn()
  }))
}))

let tempPath = '/temp'
beforeEach(() => {
  tempPath = tmpdir()
  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })
})

describe('uploadDiagnostics - success', () => {
  it('should call uploadArtifact with the correct arguments', async () => {
    // Mocking artifact client and its uploadArtifact function
    const mockUploadArtifact = jest.fn()
    const mockArtifactClient: Partial<artifact.ArtifactClient> = {
      uploadArtifact: mockUploadArtifact as any // Casting to any due to typing issues
    }
    process.env['GITHUB_SERVER_URL'] = 'https://github.com'
    jest.spyOn(artifact, 'DefaultArtifactClient').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'readdirSync').mockReturnValue(['bridge.log'])

    jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValue('.')

    await uploadDiagnostics()

    expect(mockUploadArtifact).toHaveBeenCalledTimes(1)
    expect(mockUploadArtifact).toHaveBeenCalledWith('bridge_diagnostics', ['./.bridge/bridge.log'], './.bridge', {})
  })
})

test('Test uploadDiagnostics expect API error', () => {
  let files: string[] = ['bridge.log']
  Object.defineProperty(inputs, 'DIAGNOSTICS_RETENTION_DAYS', {value: 10})
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValue('.')

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('./.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})

test('Test uploadDiagnostics - invalid value for retention days', () => {
  let files: string[] = ['bridge.log']
  Object.defineProperty(inputs, 'DIAGNOSTICS_RETENTION_DAYS', {value: 'invalid'})
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValue('.')

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('./.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})

describe('uploadSarifReport', () => {
  it('should upload Sarif report as artifact', async () => {
    // Mocking artifact client and its uploadArtifact function
    const mockUploadArtifact = jest.fn()
    const mockArtifactClient: Partial<artifact.ArtifactClient> = {
      uploadArtifact: mockUploadArtifact as any // Casting to any due to typing issues
    }
    process.env['GITHUB_SERVER_URL'] = 'https://github.com'
    jest.spyOn(artifact, 'DefaultArtifactClient').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)
    jest.spyOn(utility, 'getDefaultSarifReportPath').mockReturnValue('mocked-sarif-path')
    jest.spyOn(utility, 'checkIfPathExists').mockReturnValue(true)

    const defaultSarifReportDirectory = '.'
    const userSarifFilePath = 'mocked-sarif-path'
    const artifactName = 'mocked-artifact-name'

    await uploadSarifReportAsArtifact(defaultSarifReportDirectory, userSarifFilePath, artifactName)

    expect(mockUploadArtifact).toHaveBeenCalledTimes(1)
    expect(mockUploadArtifact).toHaveBeenCalledWith(artifactName, [userSarifFilePath], '.', {})
  })
})
