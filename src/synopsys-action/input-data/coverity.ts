import {GithubData} from './blackduck'

export interface Coverity {
  coverity: CoverityConnect
  project?: ProjectData
  github?: GithubData
  network: NetworkAirGap
}

export interface ProjectData {
  repository?: {name: string}
  branch?: {name: string}
  directory?: string
}

export interface AutomationData {
  prcomment?: boolean
}

export interface CoverityConnect {
  connect: CoverityData
  install?: {directory: string}
  automation: AutomationData
  local?: boolean
  version?: string
}

export interface CoverityData {
  user: {name: string; password: string}
  url: string
  project: {name: string}
  stream: {name: string}
  policy?: {view: string}
}

export interface NetworkAirGap {
  airGap: boolean
}
