import {cleanupTempDir, createTempDir} from '../../../src/synopsys-action/utility'
import {SynopsysToolsParameter} from '../../../src/synopsys-action/tools-parameter'
import mock = jest.mock
import * as inputs from '../../../src/synopsys-action/inputs'

let tempPath = '/temp'

beforeAll(() => {
  process.env['GITHUB_TOKEN'] = 'token'
  process.env['GITHUB_REPOSITORY'] = 'synopsys-action'
  process.env['GITHUB_HEAD_REF'] = 'branch-name'
  process.env['GITHUB_REF'] = 'refs/pull/1/merge'
  process.env['GITHUB_REPOSITORY_OWNER'] = 'synopsys-sig'
  process.env['GITHUB_REF_NAME'] = 'ref-name'

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
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: ' sca ,sast'})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForPolaris()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
})

test('Test missing data error in getFormattedCommandForPolaris', () => {
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
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

test('Enable Test getFormattedCommandForCoverity Airgap: SUCCESS', () => {
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
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'GITHUB_API_URL', {value: 'GITHUB_API_URL'})

  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Enable Test getFormattedCommandForCoverity Airgap: EXCEPTION', () => {
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
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})

  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)
  try {
    stp.getFormattedCommandForCoverity()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Github API URL is missing')
  }
})

test('Disable Test getFormattedCommandForCoverity Airgap', () => {
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
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test getFormattedCommandForCoverity - when COVERITY_LOCAL is true', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_LOCAL', {value: true})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test getFormattedCommandForCoverity - when COVERITY_LOCAL is false', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_LOCAL', {value: false})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test getFormattedCommandForCoverity - when COVERITY_VERSION is provided', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_LOCAL', {value: false})
  Object.defineProperty(inputs, 'COVERITY_VERSION', {value: '2023.6'})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test getFormattedCommandForCoverity - pr comment', () => {
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
  let stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForCoverity()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: false})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: 'false'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: 'true'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: 'FALSE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: 'TRUE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: 'FALSEEEE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: 'TRUEEEE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_AUTOMATION_PRCOMMENT', {value: ' '})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity()
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
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: true})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with createSinglePR false', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_MAXCOUNT', {value: '1'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_CREATE_SINGLE_PR', {value: 'false'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_FILTER_BY', {value: 'SEVERITIES'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_FILTER_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_LONG_TERM_GUIDANCE', {value: 'true'})
  let stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: false})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: ' '})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'TRUE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'FALSE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'TRUEEE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'FALSEEEE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: ' '})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_CREATE_SINGLE_PR', {value: 'true'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with createSinglePR true', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_CREATE_SINGLE_PR', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_MAXCOUNT', {value: ''})
  let stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)
  let resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with createSinglePR true failure', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_CREATE_SINGLE_PR', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_MAXCOUNT', {value: '1'})
  let stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)
  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('bridge_blackduck_fixpr_maxCount is not applicable with bridge_blackduck_fixpr_createSinglePR')
  }
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with invalid max count failure', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_CREATE_SINGLE_PR', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_MAXCOUNT', {value: 'invalid-val'})
  let stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)
  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid value for bridge_blackduck_fixpr_maxCount')
  }
})

test('Test getFormattedCommandForBlackduck - pr comment test cases', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_URL', {value: 'BLACKDUCK_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_API_TOKEN', {value: 'BLACKDUCK_API_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: 'false'})
  let stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: false})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: 'false'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: ' '})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: 'TRUE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: 'FALSE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: 'TRUEEE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_AUTOMATION_PRCOMMENT', {value: 'FALSEEEE'})
  stp = new SynopsysToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test missing data error in getFormattedCommandForBlackduck', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: 'BLACKDUCK_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', {value: '   BLOCKER    , CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_FIXPR_ENABLED', {value: false})
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for BlackDuck is missing')
  }
})
