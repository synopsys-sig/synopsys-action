import {run} from '../../src/main'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import {error, info} from '@actions/core'
import * as inputs from '../../src/synopsys-action/inputs'
//-----------------------------
import * as toolCache from '@actions/tool-cache'
// import * as fs from 'fs'
import * as io from '@actions/io'
import * as utility from '../../src/synopsys-action/utility'
//-----------------------------
import * as validator from '../../src/synopsys-action/validators'

describe('sample e2e', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.resetModules()
    // jest.restoreAllMocks()
    Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
    Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
    Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
    Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: null})
    Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: null})
    Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: null})
    Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: null})
    Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: null})

    Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: null})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: null})
  })

  it('should e2e 2', async () => {
    Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.61/ci-package-0.1.61-macosx.zip'})
    Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
    // Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
    Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
    Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
    Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})
    Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: __dirname})

    setAllMocks()

    /*jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('/Users/kishori/Project')
    jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(true)


    //---------------------------------------------
    jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname)
    jest.spyOn(io, 'rmRF').mockResolvedValue()
    jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
    jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
    jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
    jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)*/
    //----------------------------------------------
    try {
      const resp = await run()
      expect(resp).toBe(0)
      info('In success block')
    } catch (err: any) {
      info('In error block')
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('should e2e 3', async () => {
    Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.61/ci-package-0.1.61-macosx.zip'})
    Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
    Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
    Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'true'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})
    Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: __dirname})

    setAllMocks()

    /*jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('/Users/kishori/Project')
    jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(true)


    //---------------------------------------------
    jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname)
    jest.spyOn(io, 'rmRF').mockResolvedValue()
    jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
    jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
    jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
    jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)*/
    //----------------------------------------------
    try {
      const resp = await run()
      expect(resp).toBe(0)
      info('In success block')
    } catch (err: any) {
      info('In error block')
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })
})

function setAllMocks() {
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('/Users/kishori/Project')
  jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(true)

  //---------------------------------------------
  jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname)
  jest.spyOn(io, 'rmRF').mockResolvedValue()
  jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
  jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
  jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
  jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)
}
