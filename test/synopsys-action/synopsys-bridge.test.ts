import {SynopsysBridge} from '../../src/synopsys-action/synopsys-bridge'
import mock = jest.mock
// import path from "path";

const ioUtils = require('@actions/io/lib/io-util')
mock('@actions/io/lib/io-util')

const path = require('path')
mock('path')

const ex = require('@actions/exec')
mock('@actions/exec')

beforeEach(() => {
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

test('Test executeBridgeCommand for bridge not found', () => {
  const sb = new SynopsysBridge()

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })

  const response = sb.executeBridgeCommand('command', 'working_directory')

  expect(response).rejects.toThrowError()
})
