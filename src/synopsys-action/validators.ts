import * as fs from 'fs'
import {error} from '@actions/core'
import * as constants from '../application-constants'
import * as inputs from './inputs'

export function validateCoverityInstallDirectoryParam(installDir: string): boolean {
  if (installDir == null || installDir.length === 0) {
    error(`[${constants.COVERITY_INSTALL_DIRECTORY_KEY}] parameter for Coverity is missing`)
    return false
  }
  if (!fs.existsSync(installDir)) {
    error(`[${constants.COVERITY_INSTALL_DIRECTORY_KEY}] parameter for Coverity is invalid`)
    return false
  }
  return true
}

export function validateBlackduckFailureSeverities(severities: string[]): boolean {
  if (severities == null || severities.length === 0) {
    error('Provided value is not valid - BLACKDUCK_SCAN_FAILURE_SEVERITIES')
    return false
  }
  return true
}

export function validatePolarisInputs(): boolean {
  if (inputs.POLARIS_SERVER_URL) {
    const paramsMap = new Map()
    paramsMap.set(constants.POLARIS_ACCESS_TOKEN_KEY, inputs.POLARIS_ACCESS_TOKEN)
    paramsMap.set(constants.POLARIS_APPLICATION_NAME_KEY, inputs.POLARIS_APPLICATION_NAME)
    paramsMap.set(constants.POLARIS_PROJECT_NAME_KEY, inputs.POLARIS_PROJECT_NAME)
    paramsMap.set(constants.POLARIS_SERVER_URL_KEY, inputs.POLARIS_SERVER_URL)
    paramsMap.set(constants.POLARIS_ASSESSMENT_TYPES_KEY, inputs.POLARIS_ASSESSMENT_TYPES)
    return validateParameters(paramsMap, constants.POLARIS_KEY)
  }
  return false
}

export function validateCoverityInputs(): boolean {
  if (inputs.COVERITY_URL) {
    const paramsMap = new Map()
    paramsMap.set(constants.COVERITY_USER_KEY, inputs.COVERITY_USER)
    paramsMap.set(constants.COVERITY_PASSPHRASE_KEY, inputs.COVERITY_PASSPHRASE)
    paramsMap.set(constants.COVERITY_URL_KEY, inputs.COVERITY_URL)
    paramsMap.set(constants.COVERITY_PROJECT_NAME_KEY, inputs.COVERITY_PROJECT_NAME)
    paramsMap.set(constants.COVERITY_STREAM_NAME_KEY, inputs.COVERITY_STREAM_NAME)
    return validateParameters(paramsMap, constants.COVERITY_KEY)
  }
  return false
}

export function validateBlackDuckInputs(): boolean {
  if (inputs.BLACKDUCK_URL) {
    const paramsMap = new Map()
    paramsMap.set(constants.BLACKDUCK_URL_KEY, inputs.BLACKDUCK_URL)
    paramsMap.set(constants.BLACKDUCK_API_TOKEN_KEY, inputs.BLACKDUCK_API_TOKEN)
    return validateParameters(paramsMap, constants.BLACKDUCK_KEY)
  }
  return false
}

export function validateParameters(params: Map<string, string>, toolName: string): boolean {
  const invalidParams: string[] = []
  for (const param of params.entries()) {
    if (param[1] == null || param[1].length === 0) {
      invalidParams.push(param[0])
    }
  }
  if (invalidParams.length > 0) {
    error(`[${invalidParams.join()}] - required parameters for ${toolName} is missing`)
    return false
  }
  return true
}

export function validateBridgeUrl(url: string): boolean {
  if (!url.match('.*\\.(zip|ZIP)$')) {
    return false
  }
  const osName = process.platform
  const fileNameComponent = url.substring(url.lastIndexOf('/'), url.length)
  if (osName === 'darwin') {
    return fileNameComponent.toLowerCase().includes('mac')
  } else if (osName === 'linux') {
    return fileNameComponent.toLowerCase().includes('linux')
  } else if (osName === 'win32') {
    return fileNameComponent.toLowerCase().includes('win')
  } else {
    return false
  }
}
