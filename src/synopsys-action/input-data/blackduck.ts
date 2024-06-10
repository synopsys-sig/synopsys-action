import {Reports} from './reports'

export enum BLACKDUCK_SCAN_FAILURE_SEVERITIES {
  ALL = 'ALL',
  NONE = 'NONE',
  BLOCKER = 'BLOCKER',
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  OK = 'OK',
  TRIVIAL = 'TRIVIAL',
  UNSPECIFIED = 'UNSPECIFIED'
}

export interface Blackduck {
  blackduck: BlackduckData
  project?: ProjectData
  github?: GithubData
  network?: NetworkAirGap
}

export interface BlackduckData {
  url: string
  token: string
  install?: {directory: string}
  scan?: {full?: boolean; failure?: {severities: BLACKDUCK_SCAN_FAILURE_SEVERITIES[]}}
  automation?: AutomationData
  fixpr?: BlackDuckFixPrData
  reports?: Reports
  search?: Search
  config?: Config
  args?: string
}

export interface ProjectData {
  directory?: string
}

export interface Branch {
  name: string
}

export interface Owner {
  name: string
}

export interface User {
  token: string
}

export interface Search {
  depth: string
}

export interface Config {
  path: string
}

export interface Repository {
  name: string
  branch: Branch
  owner: Owner
  pull?: {number?: number}
}

export interface AutomationData {
  prcomment?: boolean
  fixpr?: boolean
}

export interface GithubData {
  user: User
  repository: Repository
  host?: GithubURL
}

export interface BlackDuckFixPrData {
  enabled?: boolean
  maxCount?: number
  createSinglePR?: boolean
  useUpgradeGuidance?: string[]
  filter?: BlackDuckFixPrFilerData
}

export interface BlackDuckFixPrFilerData {
  severities?: string[]
}

export interface GithubURL {
  url: string
}

export interface NetworkAirGap {
  airGap: boolean
}
