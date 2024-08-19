import {GithubData} from './github'
import {AsyncMode} from './async-mode'

export interface Coverity {
  coverity: CoverityConnect
  project?: ProjectData
  github?: GithubData
  network?: NetworkAirGap
}

export interface ProjectData {
  repository?: {name: string}
  branch?: {name: string}
  directory?: string
}

export interface AutomationData {
  prcomment?: boolean
}

export interface CoverityConnect extends CoverityArbitrary, AsyncMode {
  connect: CoverityData
  install?: {directory: string}
  automation?: AutomationData
  local?: boolean
  version?: string
}

export interface CoverityArbitrary {
  build?: Command
  clean?: Command
  config?: Config
  args?: string
}

export interface Config {
  path: string
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

export interface Command {
  command: string
}
