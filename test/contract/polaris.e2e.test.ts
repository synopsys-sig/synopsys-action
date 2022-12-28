import {run} from '../../src/main'
import {error, info} from '@actions/core'
import {mockBridgeDownloadUrlAndSynopsysBridgePath, setAllMocks} from './mocking-utility.test'
import * as inputs from "../../src/synopsys-action/inputs";

const polarisParamsMap: Map<string, string> = new Map<string, string>()
polarisParamsMap.set('POLARIS_SERVER_URL', 'POLARIS_SERVER_URL')
polarisParamsMap.set('POLARIS_ACCESS_TOKEN', 'POLARIS_ACCESS_TOKEN')
polarisParamsMap.set('POLARIS_APPLICATION_NAME', 'POLARIS_APPLICATION_NAME')
polarisParamsMap.set('POLARIS_PROJECT_NAME', 'POLARIS_PROJECT_NAME')
polarisParamsMap.set('POLARIS_ASSESSMENT_TYPES', '["SCA", "SAST"]')

describe('Polaris flow contract', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.resetModules()
    resetMockPolarisParams()
  })

  it('With all mandatory fields', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockPolarisParamsExcept('NONE')

    setAllMocks()

    const resp = await run()
    expect(resp).toBe(0)
  })

  it('With missing mandatory field polaris.access.token', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
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
    mockBridgeDownloadUrlAndSynopsysBridgePath()
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
    mockBridgeDownloadUrlAndSynopsysBridgePath()
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
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockPolarisParamsExcept('POLARIS_ASSESSMENT_TYPES')

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With bridge.break set to tru', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
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
