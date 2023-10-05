import {GithubData} from './blackduck'
import {Reports} from './reports'

export interface Polaris {
  polaris: PolarisData
  github?: GithubData
  reports?: Reports
}

export interface PolarisData {
  triage?: string
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  branch: Branch
  assessment: {types: string[]}
  prComment?: PrComment
}

export interface PrComment {
  enabled?: boolean
  severities?: string[]
}

export interface Branch {
  name?: string
  parent: {name?: string}
}
