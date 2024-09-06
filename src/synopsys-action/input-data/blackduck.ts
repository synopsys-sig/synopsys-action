import {Reports} from './reports'
import {AsyncMode} from './async-mode'

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

export interface BlackduckData extends BlackDuckArbitrary, AsyncMode {
  url: string
  token: string
  install?: {directory: string}
  scan?: {full?: boolean; failure?: {severities: BLACKDUCK_SCAN_FAILURE_SEVERITIES[]}}
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

export interface BlackDuckArbitrary {
  search?: Search
  config?: Config
  args?: string
}

export interface ProjectData {
  directory?: string
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
