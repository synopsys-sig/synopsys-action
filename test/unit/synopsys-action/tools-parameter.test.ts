import {cleanupTempDir, createTempDir} from '../../../src/synopsys-action/utility'
import {SynopsysToolsParameter} from '../../../src/synopsys-action/tools-parameter'
import mock = jest.mock
import * as inputs from '../../../src/synopsys-action/inputs'

let tempPath = '/temp'

beforeAll(() => {
  createTempDir().then(path => (tempPath = path))
})

afterAll(() => {
  cleanupTempDir(tempPath)
})

const fs = require('fs')
mock('fs')

test('Test getFormattedCommandForPolaris', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: " sca ,sast"})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForPolaris()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
})

test('Test missing data error in getFormattedCommandForPolaris', () => {
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: "SCA"})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForPolaris()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('parameters for Altair is missing')
  }
})

test('Test invalid data error in getFormattedCommandForPolaris', () => {
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForPolaris()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid value for polaris_assessment_types')
  }
})

test('Test getFormattedCommandForCoverity', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_INSTALL_DIRECTORY', {value: 'COVERITY_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'COVERITY_POLICY_VIEW', {value: 'COVERITY_POLICY_VIEW'})
  Object.defineProperty(inputs, 'COVERITY_REPOSITORY_NAME', {value: 'COVERITY_REPOSITORY_NAME'})
  Object.defineProperty(inputs, 'COVERITY_BRANCH_NAME', {value: 'COVERITY_BRANCH_NAME'})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test missing data error in getFormattedCommandForCoverity', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForCoverity()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for Coverity is missing')
  }
})

test('Test in getFormattedCommandForCoverityInstallDirectory', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    fs.existsSync = jest.fn()
    fs.existsSync.mockReturnValueOnce(false)
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    })
    stp.getFormattedCommandForCoverity()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid Install Directory')
  }
})

test('Test getFormattedCommandForBlackduck', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test missing data error in getFormattedCommandForBlackduck', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '["ALL"]'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_FIXPR', {value: 'false'})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for BlackDuck is missing')
  }
})