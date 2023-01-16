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
}

export interface BlackduckData {
  url: string
  token: string
  install?: {directory: string}
  scan?: {full?: boolean; failure?: {severities: BLACKDUCK_SCAN_FAILURE_SEVERITIES[]}}
}

export const FIXPR_ENVIRONMENT_VARIABLES = {
  'GITHUB_TOKEN' : {
    'GITHUB_ENV': 'GITHUB_TOKEN',
    'BRIDGE_ENV': 'BRIDGE_github_user_token'
  },
  'GITHUB_REPOSITORY' : {
    'GITHUB_ENV': 'GITHUB_REPOSITORY',
    'BRIDGE_ENV': 'BRIDGE_github_repository_name'
  },
  'GITHUB_REF_NAME' : {
    'GITHUB_ENV': 'GITHUB_REF_NAME',
    'BRIDGE_ENV': 'BRIDGE_github_repository_branch_name'
  },
  'GITHUB_REPOSITORY_OWNER' : {
    'GITHUB_ENV': 'GITHUB_REPOSITORY_OWNER',
    'BRIDGE_ENV': 'BRIDGE_github_repository_owner_name'
  }
}
