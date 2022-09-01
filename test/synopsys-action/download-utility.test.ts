import mock = jest.mock
import {extractZipped, getRemoteFile} from '../../src/synopsys-action/download-utility'
import {cleanupTempDir, createTempDir} from '../../src/synopsys-action/utility'

const path = require('path')
mock('path')

const toolCache = require('@actions/tool-cache')
mock('@actions/tool-cache')

let tempPath = '/temp'

beforeEach(() => {
  // jest.resetModules()
  createTempDir().then(path => (tempPath = path))
  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })
})

afterAll(() => {
  cleanupTempDir(tempPath)
})

test('Test getRemoteFile', () => {
  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  toolCache.downloadTool = jest.fn()
  toolCache.downloadTool.mockReturnValueOnce('/path-to-bridge/bridge')

  getRemoteFile(tempPath, 'http://synopsys.bridge.com/bridge_macOs_1.zip').then(data => {
    expect(data.fileName).toContain('bridge')
  })
})

test('Test getRemoteFile for url to be empty', () => {
  path.join = jest.fn()
  path.join.mockReturnValueOnce('/user')

  toolCache.downloadTool = jest.fn()
  toolCache.downloadTool.mockReturnValueOnce('/path-to-bridge/bridge')

  const response = getRemoteFile(tempPath, '')
  expect(response).rejects.toThrowError()
})

test('Test extractZipped', () => {
  toolCache.extractZip = jest.fn()

  toolCache.extractZip.mockReturnValueOnce('/destination-directory')

  extractZipped('file', '/destination-directory').then(data => {
    expect(data).toBe(true)
  })
})

test('Test extractZipped for file name to be empty', () => {
  toolCache.extractZip = jest.fn()

  toolCache.extractZip.mockReturnValueOnce('/destination-directory')

  let returnedResponse
  const response = extractZipped('', '/destination-directory')
  expect(response).rejects.toThrowError()
})

test('Test extractZipped for destination path to be empty', () => {
  toolCache.extractZip = jest.fn()

  toolCache.extractZip.mockReturnValueOnce('/destination-directory')

  let returnedResponse
  const response = extractZipped('file', '')
  expect(response).rejects.toThrowError()
})
