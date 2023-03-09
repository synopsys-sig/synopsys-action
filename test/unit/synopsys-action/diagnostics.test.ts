import {ArtifactClient, UploadResponse} from '@actions/artifact'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import {tmpdir} from 'os'
import {uploadDiagnostics} from '../../../src/synopsys-action/diagnostics'

const fs = require('fs')
import * as artifact from '@actions/artifact'

import * as inputs from '../../../src/synopsys-action/inputs'

let tempPath = '/temp'

beforeEach(() => {
  tempPath = tmpdir()
  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })
})
/*
test('Test uploadDiagnostics', () => {
  const uploadResponse: UploadResponse = {
    artifactItems: ['bridge.log'],
    artifactName: 'bridge_diagnostics',
    failedItems: [],
    size: 0
  }
  let files: string[] = ['bridge.log']
  Object.defineProperty(inputs, 'DIAGNOSTICS_RETENTION_DAYS', {value: 10})

  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('../synopsys-action')

  artifactClient.uploadArtifact = jest.fn()
  artifactClient.uploadArtifact.mockReturnValue(uploadResponse)

  fs.readdirSync = jest.fn()
  fs.readdirSync.mockReturnValue(files)

  jest.spyOn(fs.statSync('../synopsys-action/.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)

  uploadDiagnostics().then(data => {
    expect(data.artifactName).toBe(uploadResponse.artifactName)
  })
})*/

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
  const actualObj = artifact.create()
  const somethingSpy = jest.spyOn(actualObj, 'uploadArtifact').mockImplementation()
  somethingSpy.mockReturnValue(Promise.resolve(uploadResponse))
  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('../synopsys-action/.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})
