import {logBridgeExitCodes, run} from '../../src/main'
import * as inputs from '../../src/synopsys-action/inputs'
import {SynopsysBridge} from '../../src/synopsys-action/synopsys-bridge'
import {DownloadFileResponse} from '../../src/synopsys-action/download-utility'
import * as downloadUtility from './../../src/synopsys-action/download-utility'
import * as configVariables from 'actions-artifact-v2/lib/internal/shared/config'
import * as diagnostics from '../../src/synopsys-action/artifacts'
import {UploadArtifactResponse} from 'actions-artifact-v2'
import {GithubClientServiceBase} from '../../src/synopsys-action/service/impl/github-client-service-base'
import * as utility from '../../src/synopsys-action/utility'
import {GitHubClientServiceFactory} from '../../src/synopsys-action/factory/github-client-service-factory'
import {GithubClientServiceCloud} from '../../src/synopsys-action/service/impl/cloud/github-client-service-cloud'

beforeEach(() => {
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'token'})
  process.env['GITHUB_REPOSITORY'] = 'synopsys-action'
  process.env['GITHUB_REF_NAME'] = 'branch-name'
  process.env['GITHUB_REF'] = 'refs/pull/1/merge'
  process.env['GITHUB_REPOSITORY_OWNER'] = 'synopsys-sig'
  jest.resetModules()
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadDiagnostics').mockResolvedValueOnce(uploadResponse)
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Not supported flow error - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
  Object.defineProperty(inputs, 'SRM_URL', {value: null})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)

  try {
    await run()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Requires at least one scan type: (polaris_server_url,coverity_url,blackduck_url,srm_url)')
  }
})

test('Not supported flow error (empty strings) - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: ''})
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: ''})
  Object.defineProperty(inputs, 'COVERITY_URL', {value: ''})
  Object.defineProperty(inputs, 'SRM_URL', {value: ''})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)

  try {
    await run()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Requires at least one scan type: (polaris_server_url,coverity_url,blackduck_url,srm_url)')
  }
})

test('Run polaris flow - run', async () => {
  jest.setTimeout(25000)
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const response = await run()

  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})

  jest.restoreAllMocks()
})

test('Run polaris flow - run: success', async () => {
  jest.setTimeout(25000)
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  const response = await run()

  expect(response).toEqual(0)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})

  jest.restoreAllMocks()
})

test('Enable airgap', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})

  const defaultDir = jest.spyOn(SynopsysBridge.prototype as any, 'getBridgeDefaultPath')
  defaultDir.mockImplementation(() => {
    return '/home'
  })

  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})
  Object.defineProperty(inputs, 'BLACKDUCK_PRCOMMENT_ENABLED', {value: true})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
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
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})
  Object.defineProperty(inputs, 'BLACKDUCK_PRCOMMENT_ENABLED', {value: true})
  delete process.env['GITHUB_REF']
  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'TRUE'})
  Object.defineProperty(process.env, 'GITHUB_TOKEN', {value: 'token123456789'})
  Object.defineProperty(process.env, 'GITHUB_REPOSITORY', {value: 'owner/repo1'})
  Object.defineProperty(process.env, 'GITHUB_REF_NAME', {value: 'ref'})
  Object.defineProperty(process.env, 'GITHUB_REPOSITORY_OWNER', {value: 'owner'})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  const response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})
})

test('Run blackduck flow with Fix pull request, missing github token - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'ALL'})

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: false})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: true})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: true})
  delete process.env['GITHUB_REF']

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://download-bridge-win.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://wrong-url-mac.zip'})

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
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

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
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
    expect(error.message).toContain('Provided Synopsys Bridge version not found in artifactory')
  }
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})

test('Run polaris flow - diagnostics', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'INCLUDE_DIAGNOSTICS', {value: 'server_url'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(1)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)

  let response = await run()
  expect(response).not.toBe(null)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})
test('Test error messages with bridge exit codes', () => {
  var errorMessage = 'Error: The process failed with exit code 2'
  expect(logBridgeExitCodes(errorMessage)).toEqual('Exit Code: 2 Error from adapter end')
})
test('Run Black Duck flow for uploading sarif result as artifact', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)

  let response = await run()
  expect(response).not.toBe(null)
  expect(diagnostics.uploadSarifReportAsArtifact).toBeCalledTimes(1)
})

test('Run Black Duck flow for uploading sarif result to advance security and artifacts', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_UPLOAD_SARIF_REPORT', {value: 'true'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockResolvedValueOnce()
  jest.spyOn(GitHubClientServiceFactory, 'getGitHubClientServiceInstance').mockResolvedValueOnce(new GithubClientServiceCloud())
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)

  let response = await run()
  expect(response).not.toBe(null)
  expect(diagnostics.uploadSarifReportAsArtifact).toBeCalledTimes(1)
  expect(GithubClientServiceBase.prototype.uploadSarifReport).toBeCalledTimes(1)
})

test('should throw error while uploading Black Duck sarif result to advance security', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_UPLOAD_SARIF_REPORT', {value: 'true'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockRejectedValueOnce(new Error('Error uploading SARIF data to GitHub Advance Security:'))
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockRejectedValueOnce(new Error('Error uploading SARIF data to GitHub Advance Security:'))
  jest.spyOn(GitHubClientServiceFactory, 'getGitHubClientServiceInstance').mockResolvedValueOnce(new GithubClientServiceCloud())
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
  try {
    await run()
  } catch (error: any) {
    expect(error.message).toEqual('Error uploading SARIF data to GitHub Advance Security:')
  }
})

test('test black duck flow for mandatory github token for uploading sarif result to github advance security', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_UPLOAD_SARIF_REPORT', {value: 'true'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: ''})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockRejectedValueOnce(new Error('Adapter failed: exit status 1'))
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockRejectedValueOnce(new Error('Error uploading SARIF data to GitHub Advance Security:'))
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
  try {
    await run()
  } catch (error: any) {
    expect(error).toContain('Missing required GitHub token for uploading SARIF report to GitHub Advanced Security')
  }
})

test('should return black duck token missing on failure', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: ''})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toEqual('[blackduck_token] - required parameters for blackduck is missing')
  }
})

test('should not execute black duck sarif create for pr context', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_CREATE', {value: 'true'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
  await run()
  expect(diagnostics.uploadSarifReportAsArtifact).toBeCalledTimes(0)
})

test('should not upload black duck sarif for pr context', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'BLACKDUCK_UPLOAD_SARIF_REPORT', {value: 'true'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockResolvedValueOnce()
  await run()
  expect(GithubClientServiceBase.prototype.uploadSarifReport).toBeCalledTimes(0)
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_REPORTS_SARIF_CREATE', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_UPLOAD_SARIF_REPORT', {value: null})
})

test('Run Polaris flow for uploading sarif result as artifact', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockResolvedValueOnce()
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
  let response = await run()
  expect(response).not.toBe(null)
  expect(diagnostics.uploadSarifReportAsArtifact).toBeCalledTimes(1)
  jest.restoreAllMocks()
})

test('test polaris flow for mandatory github token for uploading sarif result to github  advance security', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})
  Object.defineProperty(inputs, 'POLARIS_UPLOAD_SARIF_REPORT', {value: 'true'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: ''})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockResolvedValueOnce()
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
  try {
    await run()
  } catch (error: any) {
    expect(error).toContain('Missing required GitHub token for uploading SARIF report to GitHub Advanced Security')
  }
})

test('Run Polaris flow for uploading sarif result to advance security and artifacts', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})
  Object.defineProperty(inputs, 'POLARIS_UPLOAD_SARIF_REPORT', {value: 'true'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockResolvedValueOnce()
  jest.spyOn(GitHubClientServiceFactory, 'getGitHubClientServiceInstance').mockResolvedValueOnce(new GithubClientServiceCloud())
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)

  let response = await run()
  expect(response).not.toBe(null)
  expect(diagnostics.uploadSarifReportAsArtifact).toBeCalledTimes(1)
  expect(GithubClientServiceBase.prototype.uploadSarifReport).toBeCalledTimes(1)
})

test('should throw error while uploading Polaris sarif result to advance security', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: true})
  Object.defineProperty(inputs, 'POLARIS_UPLOAD_SARIF_REPORT', {value: 'true'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockRejectedValueOnce(new Error('Error uploading SARIF data to GitHub Advance Security:'))
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockRejectedValueOnce(new Error('Error uploading SARIF data to GitHub Advance Security:'))
  jest.spyOn(GitHubClientServiceFactory, 'getGitHubClientServiceInstance').mockResolvedValueOnce(new GithubClientServiceCloud())
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
  try {
    await run()
  } catch (error: any) {
    expect(error.message).toEqual('Error uploading SARIF data to GitHub Advance Security:')
  }
})

test('should return polaris access token and assessment types missing on failure', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: ''})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_UPLOAD_SARIF_REPORT', {value: 'true'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: ''})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toEqual('[polaris_access_token,polaris_assessment_types] - required parameters for polaris is missing')
  }
})

test('should not execute polaris sarif create for pr context', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: 'true'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  jest.spyOn(diagnostics, 'uploadSarifReportAsArtifact').mockResolvedValueOnce(uploadResponse)
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
  await run()
  expect(diagnostics.uploadSarifReportAsArtifact).toBeCalledTimes(0)
})

test('should not upload polaris sarif for pr context', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.7.0'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,sast'})
  Object.defineProperty(inputs, 'POLARIS_UPLOAD_SARIF_REPORT', {value: 'true'})

  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  const uploadResponse: UploadArtifactResponse = {size: 0, id: 123}
  const downloadFileResp: DownloadFileResponse = {
    filePath: 'C://user/temp/download/',
    fileName: 'C://user/temp/download/bridge-win.zip'
  }
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValueOnce('/home/bridge')
  jest.spyOn(SynopsysBridge.prototype, 'executeBridgeCommand').mockResolvedValueOnce(0)
  jest.spyOn(SynopsysBridge.prototype, 'validateBridgeVersion').mockResolvedValueOnce(true)
  jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
  jest.spyOn(GithubClientServiceBase.prototype, 'uploadSarifReport').mockResolvedValueOnce()
  await run()
  expect(GithubClientServiceBase.prototype.uploadSarifReport).toBeCalledTimes(0)
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: null})
  Object.defineProperty(inputs, 'POLARIS_UPLOAD_SARIF_REPORT', {value: null})
})
