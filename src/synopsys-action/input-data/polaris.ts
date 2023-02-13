export enum PolarisAssessmentType {
  SCA = 'SCA',
  SAST = 'SAST'
}

export interface Polaris {
  polaris: PolarisData
}

export interface PolarisData {
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  assessment: {types: string[]}
}
