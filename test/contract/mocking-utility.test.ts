import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import * as validator from '../../src/synopsys-action/validators'
import * as toolCache from '@actions/tool-cache'
import * as io from '@actions/io'
import * as utility from '../../src/synopsys-action/utility'
import * as inputs from '../../src/synopsys-action/inputs'

export function setAllMocks() {
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue(__dirname)
  jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(true)

  jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname)
  jest.spyOn(io, 'rmRF').mockResolvedValue()
  jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
  jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
  jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
  jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)
}

export function getBridgeDownloadUrl(): string {
  return 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.61/ci-package-0.1.61-macosx.zip'
}

export function mockBridgeDownloadUrlAndSynopsysBridgePath() {
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: getBridgeDownloadUrl()})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: __dirname})
}