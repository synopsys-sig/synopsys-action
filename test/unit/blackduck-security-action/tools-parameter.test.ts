import {cleanupTempDir, createTempDir, isPullRequestEvent} from '../../../src/blackduck-security-action/utility'
import {ToolsParameter} from '../../../src/blackduck-security-action/tools-parameter'
import mock = jest.mock
import * as inputs from '../../../src/blackduck-security-action/inputs'
import * as utility from '../../../src/blackduck-security-action/utility'
let tempPath = '/temp'
let polaris_input_file = '/polaris_input.json'
let coverity_input_file = '/coverity_input.json'
let blackduck_input_file = '/bd_input.json'
let srm_input_file = '/srm_input.json'

beforeAll(() => {
  createTempDir().then(path => (tempPath = path))
})

beforeEach(() => {
  process.env['GITHUB_EVENT_NAME'] = 'pull_request'
  process.env['GITHUB_TOKEN'] = 'token'
  process.env['GITHUB_REPOSITORY'] = 'blackduck-security-action'
  process.env['GITHUB_HEAD_REF'] = 'branch-name'
  process.env['GITHUB_REF'] = 'refs/pull/1/merge'
  process.env['GITHUB_REPOSITORY_OWNER'] = 'blackduck-inc'
  process.env['GITHUB_REF_NAME'] = 'ref-name'
  process.env['GITHUB_HEAD_REF'] = 'feature-branch-1'
  process.env['GITHUB_BASE_REF'] = 'main'
  process.env['GITHUB_SERVER_URL'] = 'https://custom.com'
  Object.defineProperty(inputs, 'SRM_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'SRM_PROJECT_ID', {value: null})
  Object.defineProperty(inputs, 'blackducksca_policy_badges_create', {value: null})
  Object.defineProperty(inputs, 'BLACKDUCK_POLICY_BADGES_MAX_COUNT', {value: null})
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
  Object.defineProperty(inputs, 'POLARIS_TRIAGE', {value: 'REQUIRED'})
  Object.defineProperty(inputs, 'POLARIS_TEST_SCA_TYPE', {value: 'SCA-SIGNATURE'})
  Object.defineProperty(inputs, 'POLARIS_BRANCH_NAME', {value: 'feature1'})
  Object.defineProperty(inputs, 'POLARIS_PARENT_BRANCH_NAME', {value: 'main'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')

  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: null})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: null})
})

test('Test getFormattedCommandForPolaris with default values', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'sca,sast'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.polaris.application.name).toBe('blackduck-security-action')
  expect(jsonData.data.polaris.project.name).toBe('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
})

test('Test missing data error in getFormattedCommandForPolaris', () => {
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForPolaris('blackduck-security-action')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('parameters for Altair is missing')
  }
})

test('Test invalid data error in getFormattedCommandForPolaris', () => {
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForPolaris('blackduck-security-action')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid value for polaris_assessment_types')
  }
})

test('Test getFormattedCommandForPolaris - prComment', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
})

test('Test getFormattedCommandForPolaris - pr comment for enterprise github', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')

  const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.github.host.url).toBe('https://custom.com')
})

test('Test getFormattedCommandForPolaris - pr comment for cloud github', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  process.env['GITHUB_SERVER_URL'] = 'https://github.com'
  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')

  const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
})

test('Test getFormattedCommandForPolaris with sarif params', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: false})
  Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_ISSUE_TYPES', {value: 'SAST,SCA'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
})

process.env['GITHUB_SERVER_URL'] = 'https://custom.com'

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
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
})

test('Test getFormattedCommandForCoverity with default values - pull request event', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.coverity.connect.project.name).toBe('blackduck-security-action')
  expect(jsonData.data.coverity.connect.stream.name).toBe('blackduck-security-action-main')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test getFormattedCommandForCoverity with default values - non pull request event', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  process.env['GITHUB_EVENT_NAME'] = 'Manual'
  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.coverity.connect.project.name).toBe('blackduck-security-action')
  expect(jsonData.data.coverity.connect.stream.name).toBe('blackduck-security-action-ref-name')
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
  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
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
  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: true})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  try {
    stp.getFormattedCommandForCoverity('blackduck-security-action')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Github API URL is missing')
  }
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
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
  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'ENABLE_NETWORK_AIR_GAP', {value: false})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
})

test('Test getFormattedCommandForCoverity - when COVERITY_LOCAL is true', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_LOCAL', {value: true})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
})

test('Test getFormattedCommandForCoverity - when COVERITY_LOCAL is false', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_LOCAL', {value: false})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
})

test('Test getFormattedCommandForCoverity - when COVERITY_VERSION is provided', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
  Object.defineProperty(inputs, 'COVERITY_LOCAL', {value: false})
  Object.defineProperty(inputs, 'COVERITY_VERSION', {value: '2023.6'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
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
  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  process.env['GITHUB_SERVER_URL'] = 'https://github.com'
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: false})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'false'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'true'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'FALSE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'TRUE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'FALSEEEE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'TRUEEEE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: ' '})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForCoverity('blackduck-security-action')
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: null})
  Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: null})
})

test('Test getFormattedCommandForCoverity - pr comment for enterprise github', () => {
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
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  process.env['GITHUB_SERVER_URL'] = 'https://custom.com'
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')

  const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.github.host.url).toBe('https://custom.com')
})

test('Test missing data error in getFormattedCommandForCoverity', () => {
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForCoverity('blackduck-security-action')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for Coverity is missing')
  }
})

test('Test in getFormattedCommandForCoverityInstallDirectory', () => {
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    fs.existsSync = jest.fn()
    fs.existsSync.mockReturnValueOnce(false)
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    })
    stp.getFormattedCommandForCoverity('blackduck-security-action')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid Install Directory')
  }
})

test('Test getFormattedCommandForBlackduck', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: true})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - fix pr test cases', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_MAX_COUNT', {value: '5'})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: false})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'false'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: ' '})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'TRUE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'FALSE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'TRUEEE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'FALSEEEE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: ' '})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_CREATE_SINGLE_PR', {value: 'true'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with createSinglePR true', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_CREATE_SINGLE_PR', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_MAX_COUNT', {value: ''})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_FILTER_SEVERITIES', {value: 'CRITICAL,HIGH,MEDIUM,LOW'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_UPGRADE_GUIDANCE', {value: 'LONG_TERM,SHORT_TERM'})
  let stp: ToolsParameter = new ToolsParameter(tempPath)
  let resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with createSinglePR true failure', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_CREATE_SINGLE_PR', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_MAX_COUNT', {value: '1'})
  let stp: ToolsParameter = new ToolsParameter(tempPath)
  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('blackduck_fixpr_maxCount is not applicable with blackduck_fixpr_createSinglePR')
  }
})

test('Test getFormattedCommandForBlackduck - fix pr enabled with invalid max count failure', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_CREATE_SINGLE_PR', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_MAX_COUNT', {value: 'invalid-val'})
  let stp: ToolsParameter = new ToolsParameter(tempPath)
  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid value for blackduck_fixpr_maxCount')
  }
})

test('Test getFormattedCommandForBlackduck - pr comment test cases', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: false})
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: false})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: 'false'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: ' '})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: 'TRUE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: 'FALSE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: 'TRUEEE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: 'FALSEEEE'})
  stp = new ToolsParameter(tempPath)
  resp = stp.getFormattedCommandForBlackduck()
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

test('Test getFormattedCommandForBlackduck - pr comment - for enterprise github', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: true})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: false})
  process.env['GITHUB_SERVER_URL'] = 'https://custom.com'
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  const jsonString = fs.readFileSync(tempPath.concat(blackduck_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.github.host.url).toBe('https://custom.com')
})

test('Test getFormattedCommandForBlackduck - badges', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'blackducksca_policy_badges_create', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_POLICY_BADGES_MAX_COUNT', {value: 5})
  process.env['GITHUB_SERVER_URL'] = 'https://custom.com'
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  let resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')

  const jsonString = fs.readFileSync(tempPath.concat(blackduck_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.blackducksca.policy.badges.create).toBe(true)
  expect(jsonData.data.blackducksca.policy.badges.maxCount).toBe(5)
})

test('Test getFormattedCommandForBlackduck - badges failure (empty github token)', () => {
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: ''})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: 'BLOCKER, CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'blackducksca_policy_badges_create', {value: true})
  Object.defineProperty(inputs, 'BLACKDUCK_POLICY_BADGES_MAX_COUNT', {value: 5})

  process.env['GITHUB_SERVER_URL'] = 'https://custom.com'
  let stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Missing required github token for fix pull request/pull request comments/Github Badges')
  }
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'token'})
})

test('Test missing data error in getFormattedCommandForBlackduck', () => {
  Object.defineProperty(inputs, 'DETECT_INSTALL_DIRECTORY', {value: 'DETECT_INSTALL_DIRECTORY'})
  Object.defineProperty(inputs, 'DETECT_SCAN_FULL', {value: 'TRUE'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES', {value: '   BLOCKER    , CRITICAL, MAJOR'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: false})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForBlackduck()
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for BlackDuck is missing')
  }
})

test('Test getFormattedCommandForBlackduck with sarif params', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_CREATE', {value: 'true'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_FILE_PATH', {value: '/'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
  Object.defineProperty(inputs, 'BLACKDUCK_GITHUB_TOKEN', {value: 'test-token'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: false})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForBlackduck()

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
})

it('should pass polaris source upload fields to bridge', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA, SAST'})
  Object.defineProperty(inputs, 'POLARIS_BRANCH_NAME', {value: 'feature1'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_MODE', {value: 'assessment_mode'})
  Object.defineProperty(inputs, 'PROJECT_DIRECTORY', {value: 'polaris_project_directory'})
  Object.defineProperty(inputs, 'PROJECT_SOURCE_ARCHIVE', {value: 'source_archive'})
  Object.defineProperty(inputs, 'PROJECT_SOURCE_PRESERVESYMLINKS', {value: true})
  Object.defineProperty(inputs, 'PROJECT_SOURCE_EXCLUDES', {value: 'source_exclude1,  source_exclude2'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
  expect(jsonData.data.polaris.serverUrl).toContain('server_url')
  expect(jsonData.data.polaris.accesstoken).toContain('access_token')
  expect(jsonData.data.polaris.application.name).toContain('POLARIS_APPLICATION_NAME')
  expect(jsonData.data.polaris.project.name).toContain('POLARIS_PROJECT_NAME')
  expect(jsonData.data.polaris.branch.name).toContain('feature1')
  expect(jsonData.data.polaris.assessment.mode).toContain('assessment_mode')
  expect(jsonData.data.polaris.assessment.types).toEqual(['SCA', 'SAST'])
  expect(jsonData.data.project.directory).toContain('polaris_project_directory')
  expect(jsonData.data.project.source.archive).toContain('source_archive')
  expect(jsonData.data.project.source.preserveSymLinks).toBe(true)
  expect(jsonData.data.project.source.excludes).toEqual(['source_exclude1', 'source_exclude2'])
})

it('should pass polaris SCA and SAST arbitrary fields to bridge', () => {
  Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
  Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
  Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
  Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
  Object.defineProperty(inputs, 'POLARIS_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'COVERITY_BUILD_COMMAND', {value: 'COVERITY_BUILD_COMMAND'})
  Object.defineProperty(inputs, 'COVERITY_CLEAN_COMMAND', {value: 'COVERITY_CLEAN_COMMAND'})
  Object.defineProperty(inputs, 'COVERITY_CONFIG_PATH', {value: 'COVERITY_CONFIG_PATH'})
  Object.defineProperty(inputs, 'COVERITY_ARGS', {value: 'COVERITY_ARGS'})
  Object.defineProperty(inputs, 'DETECT_SEARCH_DEPTH', {value: '2'})
  Object.defineProperty(inputs, 'DETECT_CONFIG_PATH', {value: 'DETECT_CONFIG_PATH'})
  Object.defineProperty(inputs, 'DETECT_ARGS', {value: 'DETECT_ARGS'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
  expect(jsonData.data.polaris.serverUrl).toContain('server_url')
  expect(jsonData.data.polaris.accesstoken).toContain('access_token')
  expect(jsonData.data.polaris.application.name).toContain('POLARIS_APPLICATION_NAME')
  expect(jsonData.data.polaris.project.name).toContain('POLARIS_PROJECT_NAME')
  expect(jsonData.data.polaris.branch.name).toContain('feature1')
  expect(jsonData.data.polaris.assessment.mode).toContain('assessment_mode')
  expect(jsonData.data.polaris.assessment.types).toEqual(['SCA', 'SAST'])
  expect(jsonData.data.coverity.build.command).toBe('COVERITY_BUILD_COMMAND')
  expect(jsonData.data.coverity.clean.command).toBe('COVERITY_CLEAN_COMMAND')
  expect(jsonData.data.coverity.config.path).toBe('COVERITY_CONFIG_PATH')
  expect(jsonData.data.coverity.args).toBe('COVERITY_ARGS')
  expect(jsonData.data.detect.search.depth).toBe(2)
  expect(jsonData.data.detect.config.path).toBe('DETECT_CONFIG_PATH')
  expect(jsonData.data.detect.args).toBe('DETECT_ARGS')
})

it('should pass black duck fields and project directory field to bridge', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'PROJECT_DIRECTORY', {value: 'BLACKDUCK_PROJECT_DIRECTORY'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForBlackduck()

  const jsonString = fs.readFileSync(tempPath.concat(blackduck_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
  expect(jsonData.data.blackducksca.url).toBe('BLACKDUCK_SCA_URL')
  expect(jsonData.data.blackducksca.token).toBe('BLACKDUCK_SCA_TOKEN')
  expect(jsonData.data.project.directory).toBe('BLACKDUCK_PROJECT_DIRECTORY')
})

it('should pass blackduck arbitrary fields to bridge', () => {
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
  Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
  Object.defineProperty(inputs, 'DETECT_SEARCH_DEPTH', {value: '2'})
  Object.defineProperty(inputs, 'DETECT_CONFIG_PATH', {value: 'DETECT_CONFIG_PATH'})
  Object.defineProperty(inputs, 'DETECT_ARGS', {value: 'DETECT_ARGS'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForBlackduck()

  const jsonString = fs.readFileSync(tempPath.concat(blackduck_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage blackduck')
  expect(jsonData.data.blackducksca.url).toBe('BLACKDUCK_SCA_URL')
  expect(jsonData.data.blackducksca.token).toBe('BLACKDUCK_SCA_TOKEN')
  expect(jsonData.data.detect.search.depth).toBe(2)
  expect(jsonData.data.detect.config.path).toBe('DETECT_CONFIG_PATH')
  expect(jsonData.data.detect.args).toBe('DETECT_ARGS')
})

it('should pass coverity fields and project directory field to bridge', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'PROJECT_DIRECTORY', {value: 'COVERITY_PROJECT_DIRECTORY'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  expect(jsonData.data.coverity.connect.url).toBe('COVERITY_URL')
  expect(jsonData.data.coverity.connect.user.name).toBe('COVERITY_USER')
  expect(jsonData.data.coverity.connect.user.password).toBe('COVERITY_PASSPHRASE')
  expect(jsonData.data.project.directory).toBe('COVERITY_PROJECT_DIRECTORY')
})

it('should pass coverity arbitrary fields to bridge', () => {
  Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
  Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
  Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
  Object.defineProperty(inputs, 'COVERITY_BUILD_COMMAND', {value: 'COVERITY_BUILD_COMMAND'})
  Object.defineProperty(inputs, 'COVERITY_CLEAN_COMMAND', {value: 'COVERITY_CLEAN_COMMAND'})
  Object.defineProperty(inputs, 'COVERITY_CONFIG_PATH', {value: 'COVERITY_CONFIG_PATH'})
  Object.defineProperty(inputs, 'COVERITY_ARGS', {value: 'COVERITY_ARGS'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
  expect(jsonData.data.coverity.build.command).toBe('COVERITY_BUILD_COMMAND')
  expect(jsonData.data.coverity.clean.command).toBe('COVERITY_CLEAN_COMMAND')
  expect(jsonData.data.coverity.config.path).toBe('COVERITY_CONFIG_PATH')
  expect(jsonData.data.coverity.args).toBe('COVERITY_ARGS')
})

process.env['GITHUB_SERVER_URL'] = 'https://custom.com'
describe('test black duck values passed correctly to bridge for workflow simplification', () => {
  it('should pass black duck pr comment fields to bridge in pr context', () => {
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_CREATE', {value: 'true'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_FILE_PATH', {value: '/'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
    Object.defineProperty(inputs, 'BLACKDUCK_GITHUB_TOKEN', {value: 'test-token'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: false})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: true})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: true})
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
    const stp: ToolsParameter = new ToolsParameter(tempPath)
    const resp = stp.getFormattedCommandForBlackduck()

    const jsonString = fs.readFileSync(tempPath.concat(blackduck_input_file), 'utf-8')
    const jsonData = JSON.parse(jsonString)
    expect(resp).not.toBeNull()
    expect(resp).toContain('--stage blackduck')
    expect(jsonData.data.blackducksca.automation.prcomment).toBe(true)
    expect(jsonData.data.github.host.url).toBe('https://custom.com')
    expect(jsonData.data.blackducksca.reports).toBe(undefined)
    expect(jsonData.data.blackducksca.fixpr).toBe(undefined)
  })

  it('should ignore black duck pr comment and pass fix pr and sarif fields to bridge in non pr context', () => {
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_URL', {value: 'BLACKDUCK_SCA_URL'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_TOKEN', {value: 'BLACKDUCK_SCA_TOKEN'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_CREATE', {value: 'true'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_FILE_PATH', {value: '/'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
    Object.defineProperty(inputs, 'BLACKDUCK_GITHUB_TOKEN', {value: 'test-token'})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: false})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_ENABLED', {value: true})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_PRCOMMENT_ENABLED', {value: true})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_CREATE_SINGLE_PR', {value: false})
    Object.defineProperty(inputs, 'BLACKDUCK_SCA_FIX_PR_MAX_COUNT', {value: 1})
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
    const stp: ToolsParameter = new ToolsParameter(tempPath)
    const resp = stp.getFormattedCommandForBlackduck()

    const jsonString = fs.readFileSync(tempPath.concat(blackduck_input_file), 'utf-8')
    const jsonData = JSON.parse(jsonString)
    expect(resp).not.toBeNull()
    expect(resp).toContain('--stage blackduck')
    expect(jsonData.data.blackducksca.automation).toBe(undefined)
    expect(jsonData.data.blackducksca.fixpr.enabled).toBe(true)
    expect(jsonData.data.blackducksca.reports.sarif.create).toBe(true)
    expect(jsonData.data.blackducksca.reports.sarif.file.path).toBe('/')
    expect(jsonData.data.blackducksca.reports.sarif.severities).toContain('CRITICAL')
    expect(jsonData.data.blackducksca.reports.sarif.severities).toContain('HIGH')
    expect(jsonData.data.blackducksca.reports.sarif.groupSCAIssues).toBe(false)
    expect(jsonData.data.github.host.url).toBe('https://custom.com')
  })
})

describe('test polaris values passed correctly to bridge for workflow simplification', () => {
  it('should pass polaris pr comment fields to bridge in pr context', () => {
    Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
    Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
    Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
    Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
    Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_ENABLED', {value: true})
    Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_SEVERITIES', {value: 'CRITICAL,HIGH'})
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
    const stp: ToolsParameter = new ToolsParameter(tempPath)
    const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

    const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
    const jsonData = JSON.parse(jsonString)
    expect(resp).not.toBeNull()
    expect(resp).toContain('--stage polaris')
    expect(jsonData.data.polaris.prComment.enabled).toBe(true)
    expect(jsonData.data.polaris.prComment.severities).toContain('CRITICAL')
    expect(jsonData.data.polaris.prComment.severities).toContain('HIGH')
    expect(jsonData.data.github.host.url).toBe('https://custom.com')
  })

  it('should ignore polaris pr comment and pass sarif fields to bridge in non pr context', () => {
    Object.defineProperty(inputs, 'POLARIS_SERVER_URL', {value: 'server_url'})
    Object.defineProperty(inputs, 'POLARIS_ACCESS_TOKEN', {value: 'access_token'})
    Object.defineProperty(inputs, 'POLARIS_APPLICATION_NAME', {value: 'POLARIS_APPLICATION_NAME'})
    Object.defineProperty(inputs, 'POLARIS_PROJECT_NAME', {value: 'POLARIS_PROJECT_NAME'})
    Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_ENABLED', {value: true})
    Object.defineProperty(inputs, 'POLARIS_PRCOMMENT_SEVERITIES', {value: 'CRITICAL,HIGH'})
    Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_CREATE', {value: 'true'})
    Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_FILE_PATH', {value: '/'})
    Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_SEVERITIES', {value: 'CRITICAL,HIGH'})
    Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES', {value: false})
    Object.defineProperty(inputs, 'POLARIS_REPORTS_SARIF_ISSUE_TYPES', {value: 'SAST,SCA'})
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
    const stp: ToolsParameter = new ToolsParameter(tempPath)
    const resp = stp.getFormattedCommandForPolaris('blackduck-security-action')

    const jsonString = fs.readFileSync(tempPath.concat(polaris_input_file), 'utf-8')
    const jsonData = JSON.parse(jsonString)
    expect(resp).not.toBeNull()
    expect(resp).toContain('--stage polaris')
    expect(jsonData.data.polaris.prComment).toBe(undefined)
    expect(jsonData.data.github).toBe(undefined)
    expect(jsonData.data.polaris.reports.sarif.create).toBe(true)
    expect(jsonData.data.polaris.reports.sarif.file.path).toBe('/')
    expect(jsonData.data.polaris.reports.sarif.severities).toContain('CRITICAL')
    expect(jsonData.data.polaris.reports.sarif.severities).toContain('HIGH')
    expect(jsonData.data.polaris.reports.sarif.groupSCAIssues).toBe(false)
  })
})

describe('test coverity values passed correctly to bridge for workflow simplification', () => {
  it('should pass coverity pr comment fields to bridge in pr context', () => {
    Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
    Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
    Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
    Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
    Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
    Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'true'})
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(true)
    const stp: ToolsParameter = new ToolsParameter(tempPath)
    const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

    const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
    const jsonData = JSON.parse(jsonString)
    expect(resp).not.toBeNull()
    expect(resp).toContain('--stage connect')
    expect(jsonData.data.coverity.automation.prcomment).toBe(true)
    expect(jsonData.data.github.host.url).toBe('https://custom.com')
  })

  it('should not pass coverity pr comment fields to bridge in non pr context', () => {
    Object.defineProperty(inputs, 'COVERITY_URL', {value: 'COVERITY_URL'})
    Object.defineProperty(inputs, 'COVERITY_USER', {value: 'COVERITY_USER'})
    Object.defineProperty(inputs, 'COVERITY_PASSPHRASE', {value: 'COVERITY_PASSPHRASE'})
    Object.defineProperty(inputs, 'COVERITY_PROJECT_NAME', {value: 'COVERITY_PROJECT_NAME'})
    Object.defineProperty(inputs, 'COVERITY_STREAM_NAME', {value: 'COVERITY_STREAM_NAME'})
    Object.defineProperty(inputs, 'COVERITY_PRCOMMENT_ENABLED', {value: 'true'})
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'test-token'})
    jest.spyOn(utility, 'isPullRequestEvent').mockReturnValue(false)
    const stp: ToolsParameter = new ToolsParameter(tempPath)
    const resp = stp.getFormattedCommandForCoverity('blackduck-security-action')

    const jsonString = fs.readFileSync(tempPath.concat(coverity_input_file), 'utf-8')
    const jsonData = JSON.parse(jsonString)
    expect(resp).not.toBeNull()
    expect(resp).toContain('--stage connect')
    expect(jsonData.data.coverity.automation).toBe(undefined)
    expect(jsonData.data.github).toBe(undefined)
  })
})

test('Test getFormattedCommandForSRM', () => {
  Object.defineProperty(inputs, 'SRM_URL', {value: 'srm_url'})
  Object.defineProperty(inputs, 'SRM_API_KEY', {value: 'api_key'})
  Object.defineProperty(inputs, 'SRM_ASSESSMENT_TYPES', {value: 'sca,sast'})
  Object.defineProperty(inputs, 'SRM_PROJECT_NAME', {value: 'SRM_PROJECT_NAME'})
  Object.defineProperty(inputs, 'SRM_PROJECT_ID', {value: 'SRM_PROJECT_ID'})
  Object.defineProperty(inputs, 'SRM_BRANCH_NAME', {value: 'feature'})
  Object.defineProperty(inputs, 'SRM_BRANCH_PARENT', {value: 'main'})
  Object.defineProperty(inputs, 'COVERITY_EXECUTION_PATH', {value: '/home/coverity_exec_path'})
  Object.defineProperty(inputs, 'DETECT_EXECUTION_PATH', {value: '/home/blackduck_exec_path'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForSRM('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(srm_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage srm')
  expect(jsonData.data.srm.url).toContain('srm_url')
  expect(jsonData.data.srm.apikey).toContain('api_key')
  expect(jsonData.data.srm.assessment.types).toEqual(['sca', 'sast'])
  expect(jsonData.data.srm.project.name).toContain('SRM_PROJECT_NAME')
  expect(jsonData.data.srm.project.id).toContain('SRM_PROJECT_ID')
  expect(jsonData.data.srm.branch.name).toContain('feature')
  expect(jsonData.data.srm.branch.parent).toContain('main')
  expect(jsonData.data.detect.execution.path).toContain('/home/blackduck_exec_path')
  expect(jsonData.data.coverity.execution.path).toContain('/home/coverity_exec_path')
})

test('Test getFormattedCommandForSRM with default values', () => {
  Object.defineProperty(inputs, 'SRM_URL', {value: 'srm_url'})
  Object.defineProperty(inputs, 'SRM_API_KEY', {value: 'api_key'})
  Object.defineProperty(inputs, 'SRM_ASSESSMENT_TYPES', {value: 'sca,sast'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForSRM('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(srm_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(jsonData.data.srm.project.name).toBe('blackduck-security-action')

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage srm')
})

test('Test missing data error in getFormattedCommandForSRM', () => {
  Object.defineProperty(inputs, 'SRM_URL', {value: 'srm_url'})
  const stp: ToolsParameter = new ToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForSRM('blackduck-security-action')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for SRM is missing')
  }
})

it('should pass SRM fields to bridge', () => {
  Object.defineProperty(inputs, 'SRM_URL', {value: 'srm_url'})
  Object.defineProperty(inputs, 'SRM_API_KEY', {value: 'api_key'})
  Object.defineProperty(inputs, 'SRM_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'SRM_PROJECT_NAME', {value: 'SRM_PROJECT_NAME'})
  Object.defineProperty(inputs, 'SRM_PROJECT_ID', {value: 'SRM_PROJECT_ID'})
  Object.defineProperty(inputs, 'SRM_BRANCH_NAME', {value: 'feature'})
  Object.defineProperty(inputs, 'SRM_BRANCH_PARENT', {value: 'main'})
  Object.defineProperty(inputs, 'COVERITY_EXECUTION_PATH', {value: '/home/coverity_exec_path'})
  Object.defineProperty(inputs, 'DETECT_EXECUTION_PATH', {value: '/home/blackduck_exec_path'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForSRM('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(srm_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage srm')
  expect(jsonData.data.srm.url).toContain('srm_url')
  expect(jsonData.data.srm.apikey).toContain('api_key')
  expect(jsonData.data.srm.assessment.types).toEqual(['SCA', 'SAST'])
  expect(jsonData.data.srm.project.name).toContain('SRM_PROJECT_NAME')
  expect(jsonData.data.srm.project.id).toContain('SRM_PROJECT_ID')
  expect(jsonData.data.srm.branch.name).toContain('feature')
  expect(jsonData.data.srm.branch.parent).toContain('main')
  expect(jsonData.data.detect.execution.path).toContain('/home/blackduck_exec_path')
  expect(jsonData.data.coverity.execution.path).toContain('/home/coverity_exec_path')
})

it('should pass SRM SCA and SAST arbitrary fields to bridge', () => {
  Object.defineProperty(inputs, 'SRM_URL', {value: 'srm_url'})
  Object.defineProperty(inputs, 'SRM_API_KEY', {value: 'api_key'})
  Object.defineProperty(inputs, 'SRM_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'SRM_PROJECT_NAME', {value: 'SRM_PROJECT_NAME'})
  Object.defineProperty(inputs, 'SRM_PROJECT_ID', {value: 'SRM_PROJECT_ID'})
  Object.defineProperty(inputs, 'COVERITY_BUILD_COMMAND', {value: 'COVERITY_BUILD_COMMAND'})
  Object.defineProperty(inputs, 'COVERITY_CLEAN_COMMAND', {value: 'COVERITY_CLEAN_COMMAND'})
  Object.defineProperty(inputs, 'COVERITY_CONFIG_PATH', {value: 'COVERITY_CONFIG_PATH'})
  Object.defineProperty(inputs, 'COVERITY_ARGS', {value: 'COVERITY_ARGS'})
  Object.defineProperty(inputs, 'DETECT_SEARCH_DEPTH', {value: '5'})
  Object.defineProperty(inputs, 'DETECT_CONFIG_PATH', {value: 'DETECT_CONFIG_PATH'})
  Object.defineProperty(inputs, 'DETECT_ARGS', {value: 'DETECT_ARGS'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForSRM('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(srm_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage srm')
  expect(jsonData.data.srm.url).toContain('srm_url')
  expect(jsonData.data.srm.apikey).toContain('api_key')
  expect(jsonData.data.srm.assessment.types).toEqual(['SCA', 'SAST'])
  expect(jsonData.data.srm.project.name).toContain('SRM_PROJECT_NAME')
  expect(jsonData.data.srm.project.id).toContain('SRM_PROJECT_ID')
  expect(jsonData.data.coverity.build.command).toBe('COVERITY_BUILD_COMMAND')
  expect(jsonData.data.coverity.clean.command).toBe('COVERITY_CLEAN_COMMAND')
  expect(jsonData.data.coverity.config.path).toBe('COVERITY_CONFIG_PATH')
  expect(jsonData.data.coverity.args).toBe('COVERITY_ARGS')
  expect(jsonData.data.detect.search.depth).toBe(5)
  expect(jsonData.data.detect.config.path).toBe('DETECT_CONFIG_PATH')
  expect(jsonData.data.detect.args).toBe('DETECT_ARGS')
})

it('should pass SRM fields and project directory field to bridge', () => {
  Object.defineProperty(inputs, 'SRM_URL', {value: 'srm_url'})
  Object.defineProperty(inputs, 'SRM_API_KEY', {value: 'api_key'})
  Object.defineProperty(inputs, 'SRM_ASSESSMENT_TYPES', {value: 'SCA,SAST'})
  Object.defineProperty(inputs, 'PROJECT_DIRECTORY', {value: 'SRM_PROJECT_DIRECTORY'})

  const stp: ToolsParameter = new ToolsParameter(tempPath)
  const resp = stp.getFormattedCommandForSRM('blackduck-security-action')

  const jsonString = fs.readFileSync(tempPath.concat(srm_input_file), 'utf-8')
  const jsonData = JSON.parse(jsonString)
  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage srm')
  expect(jsonData.data.srm.url).toContain('srm_url')
  expect(jsonData.data.srm.apikey).toContain('api_key')
  expect(jsonData.data.srm.assessment.types).toEqual(['SCA', 'SAST'])
  expect(jsonData.data.project.directory).toBe('SRM_PROJECT_DIRECTORY')
})
