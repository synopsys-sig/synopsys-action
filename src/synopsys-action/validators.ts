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

export function validateInputs(toolName: string): boolean {
  const paramsMap = new Map()
  switch (toolName) {
    case constants.POLARIS_KEY: {
      paramsMap.set(constants.POLARIS_ACCESS_TOKEN_KEY, inputs.POLARIS_ACCESS_TOKEN)
      paramsMap.set(constants.POLARIS_APPLICATION_NAME_KEY, inputs.POLARIS_APPLICATION_NAME)
      paramsMap.set(constants.POLARIS_PROJECT_NAME_KEY, inputs.POLARIS_PROJECT_NAME)
      paramsMap.set(constants.POLARIS_SERVER_URL_KEY, inputs.POLARIS_SERVER_URL)
      paramsMap.set(constants.POLARIS_ASSESSMENT_TYPES_KEY, inputs.POLARIS_ASSESSMENT_TYPES)
      break
    }
    case constants.COVERITY_KEY: {
      paramsMap.set(constants.COVERITY_USER_KEY, inputs.COVERITY_USER)
      paramsMap.set(constants.COVERITY_PASSPHRASE_KEY, inputs.COVERITY_PASSPHRASE)
      paramsMap.set(constants.COVERITY_URL_KEY, inputs.COVERITY_URL)
      paramsMap.set(constants.COVERITY_PROJECT_NAME_KEY, inputs.COVERITY_PROJECT_NAME)
      paramsMap.set(constants.COVERITY_STREAM_NAME_KEY, inputs.COVERITY_STREAM_NAME)
      break
    }
    case constants.BLACKDUCK_KEY: {
      paramsMap.set(constants.BLACKDUCK_URL_KEY, inputs.BLACKDUCK_URL)
      paramsMap.set(constants.BLACKDUCK_API_TOKEN_KEY, inputs.BLACKDUCK_API_TOKEN)
      paramsMap.set(constants.BLACKDUCK_INSTALL_DIRECTORY_KEY, inputs.BLACKDUCK_INSTALL_DIRECTORY)
      paramsMap.set(constants.BLACKDUCK_SCAN_FULL_KEY, inputs.BLACKDUCK_SCAN_FULL)
      break
    }
    default: {
      error('No valid scans found')
      return false
    }
  }
  return validateParameters(paramsMap, toolName)
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
