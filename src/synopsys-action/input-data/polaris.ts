export enum PolarisAssessmentType {
  SCA = 'SCA',
  SAST = 'SAST'
}

export interface Polaris {
  polaris: PolarisData
}

export interface PolarisData {
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  assessment: {types: PolarisAssessmentType[]}
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
};
