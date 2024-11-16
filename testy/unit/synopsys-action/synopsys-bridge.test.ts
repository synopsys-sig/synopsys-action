import {SynopsysBridge} from '../../../src/synopsys-action/synopsys-bridge'
import mock = jest.mock
import Mocked = jest.Mocked
import {HttpClientResponse, HttpClient} from 'typed-rest-client/HttpClient'
import {IncomingMessage} from 'http'
import {Socket} from 'net'
import {validateBridgeUrl} from '../../../src/synopsys-action/validators'
import * as inputs from '../../../src/synopsys-action/inputs'
import * as constants from '../../../src/application-constants'
import {run} from '../../../src/main'
import {error} from '@actions/core'
import * as downloadUtility from '../../../src/synopsys-action/download-utility'
import {DownloadFileResponse, extractZipped} from '../../../src/synopsys-action/download-utility'
import os from 'os'

const util = require('../../../src/synopsys-action/utility')

const ioUtils = require('@actions/io/lib/io-util')
mock('@actions/io/lib/io-util')

const path = require('path')
mock('path')

const ex = require('@actions/exec')
mock('@actions/exec')

const fs = require('fs')
mock('fs')

beforeEach(() => {
  Object.defineProperty(constants, 'RETRY_COUNT', {value: 3})
  Object.defineProperty(constants, 'RETRY_DELAY_IN_MILLISECONDS', {value: 100})
  Object.defineProperty(constants, 'NON_RETRY_HTTP_CODES', {value: new Set([200, 201, 401, 403, 416]), configurable: true})

  Object.defineProperty(process, 'platform', {
    value: process.platform
  })
})

test('Test executeBridgeCommand for MAC', () => {
  const sb = new SynopsysBridge()

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  const response = sb.executeBridgeCommand('command', 'c:\\working_directory')

  expect(response).resolves.toEqual(0)
})

test('Test executeBridgeCommand for Linux', () => {
  const sb = new SynopsysBridge()

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })

  const response = sb.executeBridgeCommand('command', 'working_directory')

  expect(response).resolves.toEqual(0)
})

test('Test executeBridgeCommand for Windows', () => {
  const sb = new SynopsysBridge()

  path.join = jest.fn()
  path.join.mockReturnValueOnce('c:\\')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('c:\\somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'win32'
  })

  const response = sb.executeBridgeCommand('command', 'working_directory')

  expect(response).resolves.toEqual(0)
})

test('Test executeBridgeCommand for bridge failure', () => {
  const sb = new SynopsysBridge()

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('')

  ex.exec = jest.fn()
  ex.exec.mockImplementation(() => {
    throw new Error()
  })

  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })

  const response = sb.executeBridgeCommand('', 'working_directory')
  expect(response).rejects.toThrowError()
})

test('Validate bridge URL Windows', () => {
  Object.defineProperty(process, 'platform', {
    value: 'win32'
  })

  const resp = validateBridgeUrl('http://download/bridge-win.zip')
  expect(resp).toBeTruthy()
})

test('Validate bridge URL MAC', () => {
  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  const resp = validateBridgeUrl('http://download/bridge-mac.zip')
  expect(resp).toBeTruthy()
})

test('Validate getSynopsysBridgePath SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY not empty', () => {
  let sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {
    value: '/users'
  })

  const resp = sb.getSynopsysBridgePath()
  expect(resp).resolves.toContain('users')
})

test('Validate getSynopsysBridgePath SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY if empty', () => {
  let sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {
    value: ''
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/Users/user')

  const resp = sb.getSynopsysBridgePath()
  expect(resp).resolves.toContain('/Users/user')
})

test('Validate bridge URL Linux', () => {
  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })

  const resp = validateBridgeUrl('http://download/bridge-linux.zip')
  expect(resp).toBeTruthy()
})

test('Test validateBridgeVersion', async () => {
  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())

  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }
  httpResponse.readBody.mockResolvedValueOnce('\n' + '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">\n' + '<html>\n' + '<head><meta name="robots" content="noindex" />\n' + '<title>Index of bds-integrations-release/com/synopsys/integration/synopsys-action</title>\n' + '</head>\n' + '<body>\n' + '<h1>Index of bds-integrations-release/com/synopsys/integration/synopsys-action</h1>\n' + '<pre>Name    Last modified      Size</pre><hr/>\n' + '<pre><a href="../">../</a>\n' + '<a href="0.1.61/">0.1.61/</a>  04-Oct-2022 23:05    -\n' + '<a href="0.1.67/">0.1.67/</a>  07-Oct-2022 00:35    -\n' + '<a href="0.1.72/">0.1.72/</a>  17-Oct-2022 19:46    -\n' + '</pre>\n' + '<hr/><address style="font-size:small;">Artifactory/7.31.13 Server at sig-repo.synopsys.com Port 80</address></body></html>')
  httpResponse.message.statusCode = 200
  jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

  const sb = new SynopsysBridge()
  const response = await sb.validateBridgeVersion('0.1.67')

  expect(response).toBe(true)
})

test('Test getVersionUrl - mac - Intel', () => {
  Object.defineProperty(process, 'platform', {value: 'darwin'})

  const sb = new SynopsysBridge()
  const response = sb.getVersionUrl('0.1.0')

  expect(response).toContain('mac')

  Object.defineProperty(process, 'platform', {value: null})
})

test('Test getVersionUrl - mac - ARM with version greater 2.1.0', () => {
  Object.defineProperty(process, 'platform', {value: 'darwin'})
  const cpusMock = jest.spyOn(os, 'cpus')
  cpusMock.mockReturnValue([
    {
      model: 'Apple M1',
      speed: 3200,
      times: {user: 100, nice: 0, sys: 50, idle: 500, irq: 0}
    }
  ])

  const sb = new SynopsysBridge()
  const response = sb.getVersionUrl('2.1.2')
  expect(response).toContain('macos_arm')
  Object.defineProperty(process, 'platform', {value: null})
  cpusMock.mockRestore()
})

test('Test getVersionUrl win', () => {
  Object.defineProperty(process, 'platform', {value: 'win32'})

  const sb = new SynopsysBridge()
  const response = sb.getVersionUrl('0.1.0')

  expect(response).toContain('win')

  Object.defineProperty(process, 'platform', {value: null})
})

test('Test getVersionUrl linux', () => {
  Object.defineProperty(process, 'platform', {value: 'linux'})

  const sb = new SynopsysBridge()
  const response = sb.getVersionUrl('0.1.0')

  expect(response).toContain('linux')

  Object.defineProperty(process, 'platform', {value: null})
})

test('Latest URL Version success', async () => {
  Object.defineProperty(constants, 'LATEST_GLOBAL_VERSION_URL', {value: 'https://artifact.com/latest/version.txt'})

  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())
  const sb = new SynopsysBridge()
  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }
  httpResponse.readBody.mockResolvedValue('Synopsys Bridge Package: 0.3.1')
  httpResponse.message.statusCode = 200
  jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

  const response = await sb.getSynopsysBridgeVersionFromLatestURL('https://artifact.com/latest/synopsy-bridge.zip')
  expect(response).toContain('0.3.1')
})

test('Latest URL Version success', async () => {
  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())
  const sb = new SynopsysBridge()
  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }
  httpResponse.readBody.mockResolvedValue('Synopsys Bridge Package: 0.3.1')
  httpResponse.message.statusCode = 200
  jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

  const response = sb.getLatestVersionUrl()
  expect(response).toContain('latest/synopsys-bridge')
})

test('Latest URL Version success for MAC ARM arch', async () => {
  Object.defineProperty(process, 'platform', {value: 'darwin'})
  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())
  const sb = new SynopsysBridge()
  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }

  httpResponse.readBody.mockResolvedValue('Synopsys Bridge Package: 2.3.1')
  httpResponse.message.statusCode = 200
  jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

  const cpusMock = jest.spyOn(os, 'cpus')
  cpusMock.mockReturnValue([
    {
      model: 'Apple M1',
      speed: 3200,
      times: {user: 100, nice: 0, sys: 50, idle: 500, irq: 0}
    }
  ])

  const response = sb.getLatestVersionUrl()
  expect(response).toContain('latest/synopsys-bridge-macos_arm')
  Object.defineProperty(process, 'platform', {value: null})
  cpusMock.mockRestore()
})

test('Latest url version if not provided', async () => {
  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())

  const stub = jest.fn()
  stub()

  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }
  httpResponse.readBody.mockResolvedValue('error')
  jest.spyOn(HttpClient.prototype, 'get').mockRejectedValue(httpResponse)

  const sb = new SynopsysBridge()
  jest.spyOn(sb, 'getSynopsysBridgeVersionFromLatestURL')
  const response = await sb.getSynopsysBridgeVersionFromLatestURL('https://artifact.com/latest/synopsy-bridge.zip')
  expect(response).toContain('')
})

test('Latest URL Version failure', async () => {
  const incomingMessage: IncomingMessage = new IncomingMessage(new Socket())

  const httpResponse: Mocked<HttpClientResponse> = {
    message: incomingMessage,
    readBody: jest.fn()
  }
  httpResponse.message.statusCode = 400
  jest.spyOn(HttpClient.prototype, 'get').mockResolvedValueOnce(httpResponse)

  const sb = new SynopsysBridge()
  const response = await sb.getSynopsysBridgeVersionFromLatestURL('https://artifact.com/latest/synopsy-bridge.zip')
  expect(response).toContain('')
})

test('Test fetch version details from BRIDGE_DOWNLOAD_URL', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: ''})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test-url/synopsys-bridge-0.1.1-macosx.zip'})

  const response = sb.downloadBridge('/working_directory')
  expect(response).rejects.toThrowError()
})

test('Test without version details from BRIDGE_DOWNLOAD_URL', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: ''})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test-url/synopsys-bridge-macosx.zip'})
  const downloadFileResp: DownloadFileResponse = {filePath: '/user/temp/download/', fileName: 'C:/ser/temp/download/bridge-win.zip'}

  jest.spyOn(SynopsysBridge.prototype, 'getSynopsysBridgeVersionFromLatestURL').mockResolvedValueOnce('0.1.0')
  jest.spyOn(downloadUtility, 'extractZipped').mockResolvedValueOnce(true)
  jest.spyOn(downloadUtility, 'getRemoteFile').mockResolvedValueOnce(downloadFileResp)
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValueOnce(false)

  try {
    sb.downloadBridge('/working_directory')
  } catch (error: any) {
    expect(error.message).toContain('')
  }
})
test('Test invalid path for SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test-dir'})
  const response = sb.downloadBridge('/working_directory')
  expect(response).rejects.toThrowError()
})

test('Test version file not exist failure', () => {
  const sb = new SynopsysBridge()
  let response = sb.checkIfVersionExists('0.1.1', '')
  expect(response).resolves.toEqual(false)
})

test('ENABLE_NETWORK_AIR_GAP enabled:Test executeBridgeCommand for MAC', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockResolvedValue(true)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockResolvedValue(true)

  const response = sb.executeBridgeCommand('command', '/Users')

  expect(response).resolves.toEqual(0)
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})

test('ENABLE_NETWORK_AIR_GAP enabled:Test executeBridgeCommand for MAC when SYNOPSYS_BRIDGE_INSTALL_DIRECTORY empty', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockResolvedValue(true)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockResolvedValue(true)

  expect(sb.validateSynopsysBridgePath()).resolves.not.toThrow()

  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
})

test('ENABLE_NETWORK_AIR_GAP enabled when SYNOPSYS_BRIDGE_INSTALL_DIRECTORY not  empty', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockResolvedValue(true)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockResolvedValue(true)
  expect(sb.validateSynopsysBridgePath()).resolves.not.toThrow()

  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})

test('ENABLE_NETWORK_AIR_GAP enabled when SYNOPSYS_BRIDGE_INSTALL_DIRECTORY is empty ', async () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValueOnce(false)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockReturnValueOnce(false)
  try {
    await sb.validateSynopsysBridgePath()
  } catch (error: any) {
    expect(error.message).toContain('Synopsys Bridge default directory does not exist')
  }

  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})
test('ENABLE_NETWORK_AIR_GAP enabled when SYNOPSYS_BRIDGE_INSTALL_DIRECTORY not empty: failure', async () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValueOnce(false)
  try {
    await sb.validateSynopsysBridgePath()
  } catch (error: any) {
    expect(error.message).toContain('Synopsys Bridge Install Directory does not exist')
  }

  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})

test('ENABLE_NETWORK_AIR_GAP enabled:Test executeBridgeCommand for MAC without url and version', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test'})

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  fs.existsSync = jest.fn()
  fs.existsSync.mockResolvedValue(true)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockResolvedValue(true)

  const response = sb.executeBridgeCommand('command', '/users')

  expect(response).resolves.toEqual(0)
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})

test('ENABLE_NETWORK_AIR_GAP enabled:Test executeBridgeCommand for Linux', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockResolvedValue(true)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockResolvedValue(true)

  const response = sb.executeBridgeCommand('command', '/Users')

  expect(response).resolves.toEqual(0)
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})

test('ENABLE_NETWORK_AIR_GAP enabled:Test executeBridgeCommand for Windows', () => {
  const sb = new SynopsysBridge()
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: '/test'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: 'https://test.com'})
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_VERSION', {value: '0.0.0'})

  Object.defineProperty(process, 'platform', {
    value: 'win32'
  })

  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/user/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  fs.existsSync = jest.fn()
  fs.existsSync.mockResolvedValue(true)

  util.checkIfPathExists = jest.fn()
  util.checkIfPathExists.mockResolvedValue(true)

  const response = sb.executeBridgeCommand('command', '/Users')

  expect(response).resolves.toEqual(0)
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY', {value: ''})
})
