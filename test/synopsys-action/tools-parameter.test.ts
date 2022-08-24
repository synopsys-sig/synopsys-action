import {SynopsysToolsParameter} from '../../src/synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from '../../src/synopsys-action/utility'

let tempPath = ''

beforeAll(() => {
  tempPath = createTempDir()
})

afterAll(() => {
  cleanupTempDir(tempPath)
})

test('Test getFormattedCommandForPolaris', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForPolaris('access_token', 'application_name', 'project_name', 'http://server_url.com', ['SAST'])

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage polaris')
})

test('Test missing data error in getFormattedCommandForPolaris', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForPolaris('', 'application_name', 'project_name', 'http://server_url.com', ['SAST'])
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('parameters for Altair is missing')
  }
})

test('Test wrong assessment type error in getFormattedCommandForPolaris', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForPolaris('access_token', 'application_name', 'project_name', 'http://server_url.com', ['SAST'])
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Provided Assessment type not found')
  }
})

test('Test getFormattedCommandForCoverity', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  const resp = stp.getFormattedCommandForCoverity('userNm', 'pwd', 'http://server_url.com', "sample")

  expect(resp).not.toBeNull()
  expect(resp).toContain('--stage connect')
})

test('Test missing data error in getFormattedCommandForCoverity', () => {
  const stp: SynopsysToolsParameter = new SynopsysToolsParameter(tempPath)

  try {
    stp.getFormattedCommandForCoverity('', 'pwd', 'http://server_url.com', 'sample')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for Coverity is missing')
  }
})
