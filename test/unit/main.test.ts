import {logBridgeExitCodes, run} from '../../src/main'
import * as inputs from '../../src/synopsys-action/inputs'
import {SynopsysBridge} from '../../src/synopsys-action/synopsys-bridge'
import {DownloadFileResponse} from '../../src/synopsys-action/download-utility'
import * as downloadUtility from './../../src/synopsys-action/download-utility'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import * as diagnostics from '../../src/synopsys-action/diagnostics'
import {UploadResponse} from '@actions/artifact'

beforeEach(() => {
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'token'})
  process.env['GITHUB_REPOSITORY'] = 'synopsys-action'
  process.env['GITHUB_REF_NAME'] = 'branch-name'
  process.env['GITHUB_REF'] = 'refs/pull/1/merge'
  process.env['GITHUB_REPOSITORY_OWNER'] = 'synopsys-sig'
  jest.resetModules()
  const uploadResponse: UploadResponse = {artifactItems: [], artifactName: '', failedItems: [], size: 0}
  jest.spyOn(diagnostics, 'uploadDiagnostics').mockResolvedValueOnce(uploadResponse)
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Not supported flow error - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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

test('Not supported flow error (empty strings) - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: ''})
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: ''})
  Object.defineProperty(inputs, 'COVERITY_URL', {value: ''})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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

test('Run polaris flow - run', async () => {
  jest.setTimeout(25000)
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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

test('Enable airgap', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'GITHUB_API_URL', {value: 'GITHUB_API_URL'})

  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
})

test('Run blackduck flow - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: true})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const uploadResponse: UploadResponse = {artifactItems: [], artifactName: '', failedItems: [], size: 0}
  jest.spyOn(diagnostics, 'uploadDiagnostics').mockResolvedValueOnce(uploadResponse)
  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
})

test('Run blackduck flow - PR COMMENT - when MR details not found', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: true})
  delete process.env['GITHUB_REF']
  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  try {
    await run()
  } catch (error) {
    expect(error).toContain('Coverity/Blackduck automation PR comment can be run only by raising PR/MR')
  }

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
})

test('Run blackduck flow with Fix pull request - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'TRUE'})
  Object.defineProperty(process.env, 'GITHUB_TOKEN', {value: 'token123456789'})
  Object.defineProperty(process.env, 'GITHUB_REPOSITORY', {value: 'owner/repo1'})
  Object.defineProperty(process.env, 'GITHUB_REF_NAME', {value: 'ref'})
  Object.defineProperty(process.env, 'GITHUB_REPOSITORY_OWNER', {value: 'owner'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})
})

test('Run blackduck flow with Fix pull request, missing github token - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: false})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  try {
    const response = await run()
  } catch (error) {
    expect(error).toContain('Missing required github token for fix pull request')
  }
})

test('Run coverity flow - run - without optional fields', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

test('Run coverity flow - run - with optional fields', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_INSTALL_DIRECTORY', {value: 'COVERITY_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'COVERITY_POLICY_VIEW', {value: 'COVERITY_POLICY_VIEW'})
  Object.defineProperty(inputs, 'COVERITY_REPOSITORY_NAME', {value: 'COVERITY_REPOSITORY_NAME'})
  Object.defineProperty(inputs, 'COVERITY_BRANCH_NAME', {value: 'COVERITY_BRANCH_NAME'})
  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: true})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

test('Run coverity flow - run - with optional fields - when MR details not found', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_INSTALL_DIRECTORY', {value: 'COVERITY_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'COVERITY_POLICY_VIEW', {value: 'COVERITY_POLICY_VIEW'})
  Object.defineProperty(inputs, 'COVERITY_REPOSITORY_NAME', {value: 'COVERITY_REPOSITORY_NAME'})
  Object.defineProperty(inputs, 'COVERITY_BRANCH_NAME', {value: 'COVERITY_BRANCH_NAME'})
  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: true})
  delete process.env['GITHUB_REF']

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)

  try {
    await run()
  } catch (error) {
    expect(error).toContain('Coverity/Blackduck automation PR comment can be run only by raising PR/MR')
  }

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

test('Run blackduck flow with download and configure option - run without optional fields', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://download-bridge-win.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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

test('Run blackduck flow with download and configure option - run with optional fields', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://download-bridge-win.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://wrong-url-mac.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  jest.spyOn(SynopsysBridge.prototype, 'checkIfSynopsysBridgeExists').mockResolvedValueOnce(false)
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
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: ''})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})

  jest.spyOn(SynopsysBridge.prototype, 'getVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
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
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
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
