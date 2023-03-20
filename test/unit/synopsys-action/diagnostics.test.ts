import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import {tmpdir} from 'os'
import {uploadDiagnostics} from '../../../src/synopsys-action/diagnostics'

const fs = require('fs')
import * as artifact from '@actions/artifact'

import * as inputs from '../../../src/synopsys-action/inputs'
import {UploadResponse} from '@actions/artifact'

let tempPath = '/temp'

beforeEach(() => {
  tempPath = tmpdir()
  Object.defineProperty(process, 'platform', {
    value: 'linux'
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
  const actualObj = artifact.create()
  const somethingSpy = jest.spyOn(actualObj, 'uploadArtifact').mockImplementation()
  somethingSpy.mockReturnValue(Promise.resolve(uploadResponse))

  const dir = (fs.readdirSync = jest.fn())
  dir.mockReturnValue(files)
  jest.spyOn(fs.statSync('../synopsys-action/.bridge/bridge.log'), 'isDirectory').mockReturnValue(false)
  uploadDiagnostics().catch(Error)
})
