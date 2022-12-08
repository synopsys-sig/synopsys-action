import {logBridgeExitCodes, run} from '../src/main'
import * as inputs from '../src/synopsys-action/inputs'
import {SynopsysBridge} from '../src/synopsys-action/synopsys-bridge'
import {DownloadFileResponse} from '../src/synopsys-action/download-utility'
import * as downloadUtility from './../src/synopsys-action/download-utility'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'

beforeEach(() => {
  jest.resetModules()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Not supported flow error - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)

  try {
    await run()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Requires at least one scan type: (polaris_serverUrl,coverity_url,blackduck_url)')
  }
})

test('Polaris - Without mandatory fields', async () => {
  jest.setTimeout(25000)
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Mandatory fields are missing for given scan[s]')
  }
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  jest.restoreAllMocks()
})

test('With one or more non-mandatory fields', async () => {
  // as if now, all are mandatory fields for Polaris
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  jest.restoreAllMocks()
})

test('Polaris - With mandatory fields', async () => {
  jest.setTimeout(25000)
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  const response = await run()

  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})

  jest.restoreAllMocks()
})

// COVERITY
test('Coverity - Without mandatory fields', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'server_url'})
  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Mandatory fields are missing for given scan[s]')
  }

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

test('Coverity - With one or more non-mandatory fields', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_INSTALL_DIRECTORY', {value: 'COVERITY_INSTALL_DIRECTORY'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

test('Coverity - With mandatory fields', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

// BLACKDUCK
test('Blackduck - Without mandatory fields', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Mandatory fields are missing for given scan[s]')
  }

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
})

test('Blackduck - With one or more non-mandatory fields', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
})

test('Blackduck - With mandatory fields', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://download-bridge-win.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
})

test('Run Bridge download and configure option with wrong download url - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://wrong-url-mac.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  jest.spyOn(downloadUtility, 'getRemoteFile').mockRejectedValueOnce(new Error('URL not found - 404'))

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Bridge url is not valid')
  }

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
})

test('Run Bridge download and configure option with empty url - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://wrong-url-mac.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  jest.spyOn(downloadUtility, 'getRemoteFile').mockRejectedValueOnce(new Error('Bridge url cannot be empty'))

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Bridge URL cannot be empty')
  }

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
})

test('Run polaris flow for bridge command failure - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})

  jest.spyOn(SynopsysBridge.prototype, 'getLatestVersion').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockRejectedValueOnce(new Error('Error in executing command'))

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Error in executing command')
  }

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})

test('Run polaris flow with provided bridge version - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  const response = await run()

  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})

test('Run polaris flow with wrong bridge version - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(false)

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('bridge version not found in artifactory')
  }

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})

test('Test error messages with bridge exit codes', () => {
  var errorMessage = 'Error: The process failed with exit code 2'
  expect(logBridgeExitCodes(errorMessage)).toEqual('Exit Code: 2 Error from adapter end')
})
