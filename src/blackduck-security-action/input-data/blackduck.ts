import {Reports} from './reports'

export enum BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES {
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
  blackducksca: BlackduckData
  detect?: BlackDuckDetect
  project?: {
    directory?: string
  }
  github?: GithubData
  network?: NetworkAirGap
}

export interface BlackduckData {
  url: string
  token: string
  scan?: {failure?: {severities: BLACKDUCK_SCA_SCAN_FAILURE_SEVERITIES[]}}
  automation?: AutomationData
  fixpr?: BlackDuckFixPrData
  reports?: Reports
  policy?: Policy
}

export interface Policy {
  badges?: Badges
}

export interface Badges {
  create?: boolean
  maxCount?: number
}

export interface BlackDuckDetect {
  install?: {directory?: string}
  scan?: {full?: boolean}
  search?: Search
  config?: Config
  args?: string
}

export interface Search {
  depth: number
}

export interface Config {
  path: string
}

export interface AutomationData {
  prcomment?: boolean
  fixpr?: boolean
}

export interface GithubData {}

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

export interface NetworkAirGap {
  airGap: boolean
}
