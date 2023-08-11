import {GithubData} from './blackduck'

export interface Polaris {
  polaris: PolarisData
  github?: GithubData
}

export interface PolarisData {
  triage?: string
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
