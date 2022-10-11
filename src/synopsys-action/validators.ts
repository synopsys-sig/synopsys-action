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

export function validateParameters(params: Map<string, string>, toolName: string): boolean {
  const invalidParams: string[] = []
  for (const param of params.entries()) {
    if (param[1] == null || param[1].length === 0) {
      invalidParams.push(param[0])
    }
  }
  if (invalidParams.length > 0) {
    error(`[${invalidParams.join()}]  - required parameters for ${toolName} is missing`)
    return false
  }
  return true
}
