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
  github?: GithubData
  network: NetworkAirGap
}

export interface BlackduckData {
  url: string
  token: string
  install?: {directory: string}
  scan?: {full?: boolean; failure?: {severities: BLACKDUCK_SCAN_FAILURE_SEVERITIES[]}}
  automation: AutomationData
  fixpr?: BlackDuckFixPrData
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

export interface Repository {
  name: string
  branch: Branch
  owner: Owner
  pull: {number?: number}
}

export interface AutomationData {
  prcomment?: boolean
  fixpr?: boolean
}

export interface BlackDuckFixPrData {
  enabled?: boolean
  maxCount?: number
  createSinglePR?: boolean
  useLongTermUpgradeGuidance?: boolean
  filter?: BlackDuckFixPrFilerData
}

export interface BlackDuckFixPrFilerData {
  by?: string
  severities?: string[]
}

export interface GithubData {
  user: User
  repository: Repository
  api?: GithubURL
}

export const FIXPR_ENVIRONMENT_VARIABLES = {
  GITHUB_TOKEN: 'GITHUB_TOKEN',
  GITHUB_REPOSITORY: 'GITHUB_REPOSITORY',
  GITHUB_HEAD_REF: 'GITHUB_HEAD_REF',
  GITHUB_REF: 'GITHUB_REF',
  GITHUB_REF_NAME: 'GITHUB_REF_NAME',
  GITHUB_REPOSITORY_OWNER: 'GITHUB_REPOSITORY_OWNER',
  GITHUB_API_URL: 'GITHUB_API_URL'
}

export interface GithubURL {
  url: string
}

export interface NetworkAirGap {
  airGap: boolean
}
