import {run} from '../src/main'
import * as inputs from '../src/synopsys-action/inputs'
import mock = jest.mock
import {SynopsysBridge} from '../src/synopsys-action/synopsys-bridge'
import {BRIDGE_DOWNLOAD_URL} from '../src/synopsys-action/inputs'
import {DownloadFileResponse} from '../src/synopsys-action/download-utility'

beforeEach(() => {
  jest.resetModules()
})

const core = require('@actions/exec')
mock('@actions/exec')

const configVar = require('@actions/artifact/lib/internal/config-variables')
mock('@actions/artifact/lib/internal/config-variables')

const downloadUtility = require('../src/synopsys-action/download-utility')
mock('../src/synopsys-action/download-utility')

const io = require('@actions/io')
mock('@actions/io')

const ioUtil = require('@actions/io/lib/io-util')
mock('@actions/io/lib/io-util')

const bridge = require('../src/synopsys-action/synopsys-bridge')
mock('../src/synopsys-action/synopsys-bridge')

const fs = require('fs')
mock('fs')

test('Not supported flow error - run', () => {
  run().catch(error => {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Not Supported Flow')
  })
})

test('Run polaris flow - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockReturnValueOnce(0)

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce('/bridge-path/bridge')

  const response = await run()
  expect(response).toBe(undefined)

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})

test('Run blackduck flow - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockReturnValueOnce(0)

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce(Promise.resolve('/bridge-path/bridge'))

  const response = await run()
  expect(response).toBe(undefined)

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
})

test('Run coverity flow - run', async () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_INSTALL_DIRECTORY', {value: 'COVERITY_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'COVERITY_POLICY_VIEW', {value: 'COVERITY_POLICY_VIEW'})
  Object.defineProperty(inputs, 'COVERITY_REPOSITORY_NAME', {value: 'COVERITY_REPOSITORY_NAME'})
  Object.defineProperty(inputs, 'COVERITY_BRANCH_NAME', {value: 'COVERITY_BRANCH_NAME'})

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockReturnValueOnce(0)

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce(Promise.resolve('/bridge-path/bridge'))

  const response = await run()
  expect(response).toBe(undefined)

  Object.defineProperty(inputs, 'COVERITY_URL', {value: null})
})

test('Run blackduck flow with download and configure option - run', async () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://download-bridge-win.zip'})

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockReturnValueOnce(0)

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce(Promise.resolve('/bridge-path/bridge'))

  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  downloadUtility.getRemoteFile = jest.fn()
  downloadUtility.getRemoteFile.mockReturnValueOnce(Promise.resolve(downloadFileResp))

  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValueOnce(true)

  fs.readdirSync = jest.fn()
  fs.readdirSync.mockReturnValueOnce(['bridge-mac.zip'])

  io.rmRF = jest.fn()
  io.rmRF.mockReturnValueOnce(Promise.resolve())

  downloadUtility.extractZipped = jest.fn()
  downloadUtility.extractZipped.mockReturnValueOnce(Promise.resolve(true))

  bridge.validateBridgeURL = jest.fn()
  bridge.validateBridgeURL.mockReturnValueOnce(true)

  const response = await run()
  expect(response).toBe(undefined)

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

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockReturnValueOnce(0)

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce(Promise.resolve('/bridge-path/bridge'))

  bridge.validateBridgeURL = jest.fn()
  bridge.validateBridgeURL.mockReturnValueOnce(true)

  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  downloadUtility.getRemoteFile = jest.fn()
  downloadUtility.getRemoteFile.mockImplementation(() => {
    throw new Error('URL not found - 404')
  })

  try {
    await run()
  } catch (error: any) {
    expect(true).toBe(true)
  }

  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: null})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
})

test('Run Bridge download and configure option with empty url - run', async () => {
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'http://wrong-url.zip'})

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockReturnValueOnce(0)

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce(Promise.resolve('/bridge-path/bridge'))

  bridge.validateBridgeURL = jest.fn()
  bridge.validateBridgeURL.mockReturnValueOnce(true)

  const downloadFileResp: DownloadFileResponse = {filePath: 'C://user/temp/download/', fileName: 'C://user/temp/download/bridge-win.zip'}
  downloadUtility.getRemoteFile = jest.fn()
  downloadUtility.getRemoteFile.mockImplementation(() => {
    throw new Error('Bridge url cannot be empty')
  })

  try {
    await run()
  } catch (error: any) {
    expect(true).toBe(true)
  }

  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: null})
})

test('Run polaris flow for bridge command failure - run', async () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: '["SCA"]'})

  configVar.getWorkSpaceDirectory = jest.fn()
  configVar.getWorkSpaceDirectory.mockReturnValueOnce('/workspace')

  core.exec = jest.fn()
  core.exec.mockImplementation(() => {
    throw new Error('Error in executing command')
  })

  ioUtil.tryGetExecutablePath = jest.fn()
  ioUtil.tryGetExecutablePath.mockReturnValueOnce(Promise.resolve('/bridge-path/bridge'))

  try {
    await run()
  } catch (error: any) {
    expect(error.message).toContain('Error')
  }

  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: null})
})
