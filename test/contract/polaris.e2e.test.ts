import {run} from '../../src/main'
import {error, info} from '@actions/core'
import {mockBridgeDownloadUrlAndSynopsysBridgePath, mockPolarisParamsExcept, resetMockPolarisParams, setAllMocks} from './mocking-utility.test'

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
