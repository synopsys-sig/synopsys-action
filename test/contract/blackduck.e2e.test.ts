import {run} from '../../src/main'
import {error, info} from '@actions/core'
import * as inputs from '../../src/synopsys-action/inputs'
import {setAllMocks} from './mocking-utility.test'

describe('Blackduck flow contract', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.resetModules()
    Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
    Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: null})

    Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: null})
  })

  it('With all mandatory fields', async () => {
    Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.61/ci-package-0.1.61-macosx.zip'})
    Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
    Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
    Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'true'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})
    Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: __dirname})

    setAllMocks()

    const resp = await run()
    expect(resp).toBe(0)
  })
})

/*function setAllMocks() {
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('/Users/kishori/Project')
  jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(true)

  //---------------------------------------------
  jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname)
  jest.spyOn(io, 'rmRF').mockResolvedValue()
  jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
  jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
  jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
  jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)
}*/
