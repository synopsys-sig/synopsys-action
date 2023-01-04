import {run} from '../../src/main'
import {mockBridgeDownloadUrlAndSynopsysBridgePath, setAllMocks} from './mocking-utility.test'
import * as inputs from "../../src/synopsys-action/inputs";
import {error, info} from "@actions/core";

const coverityParamMap: Map<string, string> = new Map<string, string>()
coverityParamMap.set('COVERITY_URL', 'https://testing.coverity.synopsys.com')
coverityParamMap.set('COVERITY_USER', 'User1')
coverityParamMap.set('COVERITY_PASSPHRASE', 'passphrase')
coverityParamMap.set('COVERITY_PROJECT_NAME', 'Project')
coverityParamMap.set('COVERITY_STREAM_NAME', 'stream')
coverityParamMap.set('COVERITY_INSTALL_DIRECTORY', '/user/coverity')
coverityParamMap.set('COVERITY_POLICY_VIEW', 'policy')
coverityParamMap.set('COVERITY_REPOSITORY_NAME', 'repo')
coverityParamMap.set('COVERITY_BRANCH_NAME', 'branch')

describe('Coverity flow contract', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.resetModules()
    resetMockCoverityParams()
  })

  it('With all mandatory fields', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockCoverityParamsExcept(['COVERITY_INSTALL_DIRECTORY', 'COVERITY_POLICY_VIEW', 'COVERITY_REPOSITORY_NAME', 'COVERITY_BRANCH_NAME'])

    setAllMocks()

    const resp = await run()
    expect(resp).toBe(0)
  })

  it('With missing mandatory fields coverity.connect.url', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockCoverityParamsExcept(['COVERITY_INSTALL_DIRECTORY', 'COVERITY_POLICY_VIEW', 'COVERITY_REPOSITORY_NAME', 'COVERITY_BRANCH_NAME', 'COVERITY_URL'])

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory fields coverity.connect.user.name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockCoverityParamsExcept(['COVERITY_INSTALL_DIRECTORY', 'COVERITY_POLICY_VIEW', 'COVERITY_REPOSITORY_NAME', 'COVERITY_BRANCH_NAME', 'COVERITY_USER'])

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory fields coverity.connect.user.password', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockCoverityParamsExcept(['COVERITY_INSTALL_DIRECTORY', 'COVERITY_POLICY_VIEW', 'COVERITY_REPOSITORY_NAME', 'COVERITY_BRANCH_NAME', 'COVERITY_PASSPHRASE'])

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory fields coverity.connect.project.name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockCoverityParamsExcept(['COVERITY_INSTALL_DIRECTORY', 'COVERITY_POLICY_VIEW', 'COVERITY_REPOSITORY_NAME', 'COVERITY_BRANCH_NAME', 'COVERITY_PROJECT_NAME'])

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })

  it('With missing mandatory fields coverity.connect.stream.name', async () => {
    mockBridgeDownloadUrlAndSynopsysBridgePath()
    mockCoverityParamsExcept(['COVERITY_INSTALL_DIRECTORY', 'COVERITY_POLICY_VIEW', 'COVERITY_REPOSITORY_NAME', 'COVERITY_BRANCH_NAME', 'COVERITY_STREAM_NAME'])

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
    mockCoverityParamsExcept(['NONE'])

    setAllMocks()

    try {
      const resp = await run()
    } catch (err: any) {
      expect(err.message).toContain('failed with exit code 2')
      error(err)
    }
  })
})

export function resetMockCoverityParams() {
  coverityParamMap.forEach((value, key) => {
    Object.defineProperty(inputs, key, {value: null})
  })
}

export function mockCoverityParamsExcept(coverityConstants: string[]) {
  coverityParamMap.forEach((value, key) => {
    if (!coverityConstants.includes(key)) {
      info(key)
      Object.defineProperty(inputs, key, {value: value})
    }
  })
}