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
