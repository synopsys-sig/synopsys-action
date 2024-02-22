import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import {tmpdir} from 'os'
import {uploadDiagnostics, uploadSarifReportAsArtifact} from '../../../src/synopsys-action/artifacts'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {UploadOptions} from '@actions/artifact/lib/internal/upload-options'
import * as inputs from '../../../src/synopsys-action/inputs'
import {UploadResponse} from '@actions/artifact'
import * as artifact from '@actions/artifact'
const fs = require('fs')
import * as utility from '../../../src/synopsys-action/utility'

let tempPath = '/temp'
beforeEach(() => {
  tempPath = tmpdir()
  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })
  jest.mock('@actions/artifact')
})

describe('uploadDiagnostics - success', () => {
  it('should call uploadArtifact with the correct arguments', async () => {
    const mockUploadArtifact = jest.fn()
    const mockArtifactClient: Partial<artifact.ArtifactClient> = {
      uploadArtifact: mockUploadArtifact
    }
    const mockCreate = jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)

    const mockPwd = './.bridge'
    const mockFiles = ['./.bridge/bridge.log']
    const mockOptions: UploadOptions = {continueOnError: false}
    jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('.')

    await uploadDiagnostics()

    expect(mockUploadArtifact).toHaveBeenCalledWith('bridge_diagnostics', mockFiles, mockPwd, mockOptions)
    mockCreate.mockRestore()
  })
})

test('Test uploadDiagnostics expect API error', () => {
  const uploadResponse: UploadResponse = {
    artifactItems: ['bridge.log'],
    artifactName: 'bridge_diagnostics',
    failedItems: [],
    size: 0
  }
  let files: string[] = ['bridge.log']
  Object.defineProperty(inputs, 'DIAGNOSTICS_RETENTION_DAYS', {value: 10})
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('.')

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('./.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})

test('Test uploadDiagnostics - invalid value for retention days', () => {
  const uploadResponse: UploadResponse = {
    artifactItems: ['bridge.log'],
    artifactName: 'bridge_diagnostics',
    failedItems: [],
    size: 0
  }
  let files: string[] = ['bridge.log']
  Object.defineProperty(inputs, 'DIAGNOSTICS_RETENTION_DAYS', {value: 'invalid'})
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('.')

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('./.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})

describe('uploadSarifReport', () => {
  it('should uploadSarifReport successfully', async () => {
    const mockUploadArtifact = jest.fn()
    const mockArtifactClient: Partial<artifact.ArtifactClient> = {
      uploadArtifact: mockUploadArtifact
    }
    const mockCreate = jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)
    jest.spyOn(utility, 'checkIfPathExists').mockReturnValue(true)
    jest.spyOn(utility, 'getDefaultSarifReportPath').mockReturnValue('test-path')
    jest.spyOn(mockArtifactClient, 'uploadArtifact')
    await uploadSarifReportAsArtifact('test-dir', 'test-path', 'test-artifact')
    expect(mockUploadArtifact).toHaveBeenCalled()
    expect(mockUploadArtifact).toHaveBeenCalledWith('test-artifact', ['test-path'], '.', {continueOnError: false})
    mockCreate.mockRestore()
  })
})
