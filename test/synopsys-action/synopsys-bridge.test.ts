import {SynopsysBridge} from '../../src/synopsys-action/synopsys-bridge'
import mock = jest.mock

const ioUtils = require('@actions/io/lib/io-util')
mock('@actions/io/lib/io-util')

const ex = require('@actions/exec')
mock('@actions/exec')

beforeEach(() => {
  Object.defineProperty(process, 'platform', {
    value: process.platform
  })
})

test('Test executeBridgeCommand for mac', () => {
  const sb = new SynopsysBridge()

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'darwin'
  })

  const response = sb.executeBridgeCommand('command')

  expect(response).resolves.toEqual(0)
})

test('Test executeBridgeCommand for linux', () => {
  const sb = new SynopsysBridge()

  ioUtils.tryGetExecutablePath = jest.fn()
  ioUtils.tryGetExecutablePath.mockReturnValueOnce('/somepath')

  ex.exec = jest.fn()
  ex.exec.mockReturnValueOnce(0)

  Object.defineProperty(process, 'platform', {
    value: 'linux'
  })

  const response = sb.executeBridgeCommand('command')

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

  const response = sb.executeBridgeCommand('command')

  expect(response).rejects.toThrowError()
})
