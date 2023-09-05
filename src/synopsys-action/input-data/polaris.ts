import {GithubData} from './blackduck'

export enum PolarisAssessmentType {
  SCA = 'SCA',
  SAST = 'SAST'
}

export interface Polaris {
  polaris: PolarisData
  github?: GithubData
}

export interface PolarisData {
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  assessment: {types: string[]}
  prComment?: PrComment
}

export interface PrComment {
  enabled?: boolean
  severities?: string[]
}
