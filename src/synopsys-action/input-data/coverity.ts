import {GithubData} from './blackduck'

export interface Coverity {
  coverity: CoverityConnect
  project: ProjectData
  github?: GithubData
  network: NetworkAirGap
  environment: EnvironmentSacn
}

export interface ProjectData {
  repository?: {name: string}
  branch?: {name: string}
}

export interface AutomationData {
  prcomment?: boolean
}

export interface CoverityConnect {
  connect: CoverityData
  install?: {directory: string}
  automation: AutomationData
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

export interface EnvironmentSacn {
  scan: PullEnv
}

export interface PullEnv {
  pull: boolean
}
