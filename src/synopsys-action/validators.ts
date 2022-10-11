import * as fs from 'fs'
import {info, error} from '@actions/core'

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
  for (const item of params) {
    if (item == null || item.length === 0) {
      invalidParams.push(item)
    }
  }
  if (invalidParams.length > 0) {
    info(invalidParams.join())
    error(invalidParams.join().concat(' - required parameters for'.concat(toolName).concat('is missing')))
    return false
  }
  return true
}
