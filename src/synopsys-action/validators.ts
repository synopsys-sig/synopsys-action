import * as fs from 'fs'
export function validatePolarisParams(accessToken: string, applicationName: string, projectName: string, serverURL: string, assessmentTypes: string[]): void {
  if (accessToken == null || accessToken.length === 0 || applicationName == null || applicationName.length === 0 || projectName == null || projectName.length === 0 || serverURL == null || serverURL.length === 0 || assessmentTypes.length === 0) {
    throw new Error('One or more required parameters for Altair is missing')
  }
}

export function validateCoverityParams(userName: string, passWord: string, coverityUrl: string, projectName: string, streamName: string): void {
  if (userName == null || userName.length === 0 || passWord == null || passWord.length === 0 || coverityUrl == null || coverityUrl.length === 0 || projectName == null || projectName.length === 0 || streamName == null || streamName.length === 0) {
    throw new Error('One or more required parameters for Coverity is missing')
  }
}

export function validateCoverityInstallDirectoryParam(installDir: string): void {
  if (installDir == null || installDir.length === 0) {
    throw new Error('One or more required parameters for Coverity is missing')
  }
  if (!fs.existsSync(installDir)) {
    throw new Error('Invalid Install Directory')
  }
}

export function validateBalckduckParams(url: string, apiToken: string, installDirectory: string): void {
  if (url == null || url.length === 0 || apiToken == null || apiToken.length === 0 || installDirectory == null || installDirectory.length === 0) {
    throw new Error('One or more required parameters for BlackDuck is missing')
  }
}

export function validateBlackduckFailureSeverities(severities: string[]): void {
  if (severities == null || severities.length === 0) {
    throw new Error('Provided value is not valid - BLACKDUCK_SCAN_FAILURE_SEVERITIES')
  }
}
