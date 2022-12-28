import {run} from '../../src/main'
// import {error, info} from '@actions/core'
// import * as inputs from '../../src/synopsys-action/inputs'
import {mockBridgeDownloadUrlAndSynopsysBridgePath, setAllMocks} from './mocking-utility.test'
import * as inputs from "../../src/synopsys-action/inputs";
import {info} from "@actions/core";

const blackduckParamMap: Map<string, string> = new Map<string, string>()
blackduckParamMap.set('BLACKDUCK_URL', 'BLACKDUCK_URL')
blackduckParamMap.set('BLACKDUCK_API_TOKEN', 'BLACKDUCK_API_TOKEN')
blackduckParamMap.set('BLACKDUCK_SCAN_FULL', 'true')
blackduckParamMap.set('BLACKDUCK_SCAN_FAILURE_SEVERITIES', '[ALL]')
blackduckParamMap.set('BLACKDUCK_INSTALL_DIRECTORY', '/User/home')

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