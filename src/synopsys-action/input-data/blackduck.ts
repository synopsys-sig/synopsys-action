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
}

export interface BlackduckData {
  url: string
  token: string
  install?: {directory: string}
  scan?: {full?: boolean; failure?: {severities: BLACKDUCK_SCAN_FAILURE_SEVERITIES[]}}
  automation?: {fixpr?: boolean}
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
}

export interface GithubData {
  user: User
  repository: Repository
}

export const FIXPR_ENVIRONMENT_VARIABLES = {
  GITHUB_TOKEN: 'GITHUB_TOKEN',
  GITHUB_REPOSITORY: 'GITHUB_REPOSITORY',
  GITHUB_REF_NAME: 'GITHUB_REF_NAME',
  GITHUB_REPOSITORY_OWNER: 'GITHUB_REPOSITORY_OWNER'
}
