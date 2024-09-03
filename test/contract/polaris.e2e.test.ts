import {run} from '../../src/main'
import {error} from '@actions/core'
import * as inputs from '../../src/blackduck-security-action/inputs'
import * as configVariables from 'actions-artifact-v2/lib/internal/shared/config'
import * as validator from '../../src/blackduck-security-action/validators'
import * as toolCache from '@actions/tool-cache'
import * as toolCacheLocal from '../../src/blackduck-security-action/tool-cache-local'
import * as io from '@actions/io'
import * as utility from '../../src/blackduck-security-action/utility'
import {BRIDGE_CLI_DOWNLOAD_URL, POLARIS_APPLICATION_NAME, POLARIS_ASSESSMENT_TYPES, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL, POLARIS_TRIAGE} from '../../src/blackduck-security-action/inputs'

const polarisParamsMap: Map<string, string> = new Map<string, string>()
polarisParamsMap.set('POLARIS_SERVER_URL', 'POLARIS_SERVER_URL')
polarisParamsMap.set('POLARIS_ACCESS_TOKEN', 'POLARIS_ACCESS_TOKEN')
polarisParamsMap.set('POLARIS_APPLICATION_NAME', 'POLARIS_APPLICATION_NAME')
polarisParamsMap.set('POLARIS_PROJECT_NAME', 'POLARIS_PROJECT_NAME')
polarisParamsMap.set('POLARIS_ASSESSMENT_TYPES', 'SCA,SAST')
polarisParamsMap.set('POLARIS_TRIAGE', 'NOT_ENTITLED')

describe('Polaris flow contract', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.resetModules()
    resetMockPolarisParams()
  })

  it('With all mandatory fields', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('NONE')

    setAllMocks()

    const resp = await run()
    expect(resp).toBe(0)
  })

  it('With all mandatory fields without Triage', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('POLARIS_TRIAGE')

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory field polaris.access.token', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('POLARIS_ACCESS_TOKEN')

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory field polaris.application.name', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('POLARIS_APPLICATION_NAME')

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory field polaris.project.name', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('POLARIS_PROJECT_NAME')

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory field polaris.assessment.type', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('POLARIS_ASSESSMENT_TYPES')

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With bridge.break set to true', async () => {
    mockBridgeDownloadUrlAndBridgePath()
    mockPolarisParamsExcept('NONE')
    process.env['POLARIS_ISSUE_FAILURE'] = 'true'

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 8')
      error(err)
    } finally {
      process.env['POLARIS_ISSUE_FAILURE'] = undefined
    }
  })
})

export function mockPolarisParamsExcept(polarisConstant: string) {
  polarisParamsMap.forEach((value, key) => {
    if (polarisConstant != key) {
      Object.defineProperty(inputs, key, {value: value})
    }
  })
}

export function resetMockPolarisParams() {
  polarisParamsMap.forEach((value, key) => {
    Object.defineProperty(inputs, key, {value: null})
  })
}

export function setAllMocks() {
  let polaris: string[] = []
  jest.spyOn(configVariables, 'getGitHubWorkspaceDir').mockReturnValue(__dirname)
  jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(polaris)
  jest.spyOn(toolCacheLocal, 'downloadTool').mockResolvedValueOnce(__dirname)
  jest.spyOn(io, 'rmRF').mockResolvedValue()
  jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted')
  jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true)
  jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue()
  jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname)
}

export function getBridgeDownloadUrl(): string {
  const WINDOWS_PLATFORM = 'win64'
  const LINUX_PLATFORM = 'linux64'
  const MAC_PLATFORM = 'macosx'
  const osName = process.platform

  let platform = ''
  if (osName === 'darwin') {
    platform = MAC_PLATFORM
  } else if (osName === 'linux') {
    platform = LINUX_PLATFORM
  } else if (osName === 'win32') {
    platform = WINDOWS_PLATFORM
  }
  return 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-bridge/latest/synopsys-bridge-'.concat(platform).concat('.zip')
}

export function mockBridgeDownloadUrlAndBridgePath() {
  Object.defineProperty(inputs, 'BRIDGE_CLI_DOWNLOAD_URL', {value: getBridgeDownloadUrl()})
  Object.defineProperty(inputs, 'BRIDGE_CLI_INSTALL_DIRECTORY_KEY', {value: __dirname})
  Object.defineProperty(inputs, 'include_diagnostics', {value: true})
  Object.defineProperty(inputs, 'diagnostics_retention_days', {value: 10})
  Object.defineProperty(inputs, 'GITHUB_TOKEN', {value: 'token'})
}
