import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import {tmpdir} from 'os'
import {uploadDiagnostics} from '../../../src/synopsys-action/diagnostics'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {UploadOptions} from '@actions/artifact/lib/internal/upload-options'
import * as inputs from '../../../src/synopsys-action/inputs'
import {UploadResponse} from '@actions/artifact'
import * as artifact from '@actions/artifact'
const fs = require('fs')

let tempPath = '/temp'
beforeEach(() => {
  tempPath = tmpdir()
  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })
})

jest.mock('@actions/artifact')

describe('uploadDiagnostics - success', () => {
  it('should call uploadArtifact with the correct arguments', async () => {
    const mockUploadArtifact = jest.fn()
    const mockArtifactClient: Partial<artifact.ArtifactClient> = {
      uploadArtifact: mockUploadArtifact
    }
    const mockCreate = jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)

    const mockPwd = '../synopsys-action/.bridge'
    const mockFiles = ['../synopsys-action/.bridge/bridge.log']
    const mockOptions: UploadOptions = {continueOnError: false}
    jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('../synopsys-action')

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
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('../synopsys-action')

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('../synopsys-action/.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
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
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('../synopsys-action')

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('../synopsys-action/.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})
