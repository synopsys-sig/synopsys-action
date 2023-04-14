import {run} from '../../src/main'
import * as inputs from '../../src/synopsys-action/inputs'
import {error, info} from '@actions/core'
import * as configVariables from '@actions/artifact/lib/internal/config-variables'
import * as validator from '../../src/synopsys-action/validators'
import * as toolCache from '@actions/tool-cache'
import * as io from '@actions/io'
import * as utility from '../../src/synopsys-action/utility'
import {format} from 'path'

const blackduckParamMap: Map<string, string> = new Map<string, string>()
blackduckParamMap.set('BLACKDUCK_URL', 'BLACKDUCK_URL')
blackduckParamMap.set('BLACKDUCK_API_TOKEN', 'BLACKDUCK_API_TOKEN')
blackduckParamMap.set('BLACKDUCK_SCAN_FULL', 'true')
blackduckParamMap.set('BLACKDUCK_SCAN_FAILURE_SEVERITIES', 'ALL')
blackduckParamMap.set('BLACKDUCK_INSTALL_DIRECTORY', '/User/home')
blackduckParamMap.set('BLACKDUCK_AUTOMATION_PRCOMMENT', 'true')
blackduckParamMap.set('BLACKDUCK_AUTOMATION_FIXPR', 'true')

describe('Blackduck flow contract', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.resetModules()
    resetMockBlackduckParams()
  })

  it('With all mandatory fields', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['BLACKDUCK_INSTALL_DIRECTORY', 'BLACKDUCK_SCAN_FAILURE_SEVERITIES'])

    setAllMocks()

    const resp = await run()
    expect(resp).toBe(0)
  })

  it('With missing mandatory fields blackduck.api.token', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['BLACKDUCK_INSTALL_DIRECTORY', 'BLACKDUCK_SCAN_FAILURE_SEVERITIES', 'BLACKDUCK_API_TOKEN'])

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With all mandatory and optional fields', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])

    setAllMocks()

    const resp = await run()
    expect(resp).toBe(0)
  })

  it('With wrong optional field blackduck.install.directories', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['BLACKDUCK_INSTALL_DIRECTORY'])

    Object.defineProperty(inputs, 'BLACKDUCK_INSTALL_DIRECTORY', {value: '/something'})

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With failure.severities set to true', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])
    process.env['BLACKDUCK_ISSUE_FAILURE'] = 'true'

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 8')
      error(err)
    } finally {
      process.env['BLACKDUCK_ISSUE_FAILURE'] = undefined
    }
  })

  it('With blackduck.automation.fixpr true and empty github token', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])
    Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: ''})
    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 1')
      error(err)
    }
  })

  it('With blackduck.automation.fixpr true and empty github repo name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])
    process.env['GITHUB_REPOSITORY'] = ''
    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 1')
      error(err)
    }
  })

  it('With blackduck.automation.fixpr true and empty github branch name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])
    process.env['GITHUB_REF_NAME'] = ''
    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 1')
      error(err)
    }
  })

  it('With blackduck.automation.fixpr true and empty github owner name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])
    blackduckParamMap.set('BLACKDUCK_SCAN_FULL', 'false') //rapid scan
    process.env['GITHUB_REPOSITORY_OWNER'] = ''
    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 1')
      error(err)
    }
  })

  it('With blackduck.automation.prcomment true and empty github owner name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockBlackduckParamsExcept(['NONE'])
    process.env['GITHUB_REPOSITORY_OWNER'] = ''
    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 1')
      error(err)
    }
  })
})

export function resetMockBlackduckParams() {
  blackduckParamMap.forEach((value, key) => {
    Object.defineProperty(inputs, key, {value: null})
  })
}

export function mockBlackduckParamsExcept(blackduckConstants: string[]) {
  blackduckParamMap.forEach((value, key) => {
    if (!blackduckConstants.includes(key)) {
      info(key)
      Object.defineProperty(inputs, key, {value: value})
    }
  })
}

export function setAllMocks() {
  let blackduck: string[] = []
  jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue(__dirname)
  jest.spyOn(validator, 'validateBlackDuckInputs').mockReturnValueOnce(blackduck)
  jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname)
  jest.spyOn(io, 'rmRF').mockResolvedValue()
  jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
  jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
  jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
  jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)
}

export function getBridgeDownloadUrl(): string {
  return 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-bridge/0.1.222/synopsys-bridge-0.1.222-macosx.zip'
}

export function mockBridgeDownloadUrlAndSynopsysBridgePath() {
  Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', {value: getBridgeDownloadUrl()})
  Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', {value: __dirname})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'token'})
  process.env['GITHUB_REPOSITORY'] = 'synopsys-action'
  process.env['GITHUB_HEAD_REF'] = 'branch-name'
  process.env['GITHUB_REF'] = 'refs/pull/1/merge'
  process.env['GITHUB_REPOSITORY_OWNER'] = 'synopsys-sig'
  process.env['GITHUB_REF_NAME'] = 'synopsys-sig'
  Object.defineProperty(inputs, 'include_diagnostics', {value: true})
  Object.defineProperty(inputs, 'diagnostics_retention_days', {value: 10})
}
