import * as fs from 'fs'
import {error} from '@actions/core'

export function validateCoverityInstallDirectoryParam(installDir: string): boolean {
  if (installDir == null || installDir.length === 0) {
    error('One or more required parameters for Coverity is missing')
    return false
  }
  if (!fs.existsSync(installDir)) {
    error('Invalid Install Directory')
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

export function validateParameters(params: string[], toolName: string): boolean {
  const invalidParams: string[] = []
  for (let i = 0; i < params.length; i++) {
    if (params[i] == null || params[i].length === 0) {
      invalidParams.push(params[i])
    }
  }
  if (invalidParams.length > 0) {
    error(invalidParams.join().concat(' - required parameters for'.concat(toolName).concat('is missing')))
    return false
  }
  return true
}
