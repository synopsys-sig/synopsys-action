import * as fs from 'fs'
import {error, info} from '@actions/core'
export function validatePolarisParams(accessToken: string, applicationName: string, projectName: string, serverURL: string, assessmentTypes: string[]): boolean {
  info('inside validatePolarisParams')
  if (accessToken == null || accessToken.length === 0 || applicationName == null || applicationName.length === 0 || projectName == null || projectName.length === 0 || serverURL == null || serverURL.length === 0 || assessmentTypes.length === 0) {
    console.log('One or more required parameters for Altair is missing, hence skipping Altair')
    return false
  }
  return true
}

export function validateCoverityParams(userName: string, passWord: string, coverityUrl: string, projectName: string, streamName: string): boolean {
  if (userName == null || userName.length === 0 || passWord == null || passWord.length === 0 || coverityUrl == null || coverityUrl.length === 0 || projectName == null || projectName.length === 0 || streamName == null || streamName.length === 0) {
    error('One or more required parameters for Coverity is missing, hence skipping Coverity')
    return false
  }
  return true
}

export function validateCoverityInstallDirectoryParam(installDir: string): boolean {
  if (installDir == null || installDir.length === 0) {
    error('One or more required parameters for Coverity is missing, hence skipping Coverity')
    return false
  }
  if (!fs.existsSync(installDir)) {
    error('Invalid Install Directory, hence skipping Coverity')
    return false
  }
  return true
}

export function validateBalckduckParams(url: string, apiToken: string): boolean {
  if (url == null || url.length === 0 || apiToken == null || apiToken.length === 0) {
    error('One or more required parameters for BlackDuck is missing, hence skipping BlackDuck')
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
