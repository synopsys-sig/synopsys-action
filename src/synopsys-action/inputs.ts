import {getInput} from '@actions/core'
import * as constants from '../application-constants'

export const SYNOPSYS_BRIDGE_PATH = getInput('synopsys_bridge_path')

//Bridge download url
export const BRIDGE_DOWNLOAD_URL = getInput('bridge_download_url')
export const BRIDGE_DOWNLOAD_VERSION = getInput('bridge_download_version')

// Polaris related inputs
export const POLARIS_ACCESS_TOKEN = getInput(constants.POLARIS_ACCESS_TOKEN_KEY)
export const POLARIS_APPLICATION_NAME = getInput(constants.POLARIS_APPLICATION_NAME_KEY)
export const POLARIS_PROJECT_NAME = getInput(constants.POLARIS_PROJECT_NAME_KEY)
export const POLARIS_ASSESSMENT_TYPES = getInput(constants.POLARIS_ASSESSMENT_TYPES_KEY)
export const POLARIS_SERVER_URL = getInput(constants.POLARIS_SERVER_URL_KEY)

// Coverity related inputs
export const COVERITY_URL = getInput(constants.COVERITY_URL_KEY)
export const COVERITY_USER = getInput(constants.COVERITY_USER_KEY)
export const COVERITY_PASSPHRASE = getInput(constants.COVERITY_PASSPHRASE_KEY)
export const COVERITY_PROJECT_NAME = getInput(constants.COVERITY_PROJECT_NAME_KEY)
export const COVERITY_STREAM_NAME = getInput(constants.COVERITY_STREAM_NAME_KEY)
export const COVERITY_INSTALL_DIRECTORY = getInput(constants.COVERITY_INSTALL_DIRECTORY_KEY)
export const COVERITY_POLICY_VIEW = getInput(constants.COVERITY_POLICY_VIEW_KEY)
export const COVERITY_REPOSITORY_NAME = getInput(constants.COVERITY_REPOSITORY_NAME_KEY)
export const COVERITY_BRANCH_NAME = getInput(constants.COVERITY_BRANCH_NAME_KEY)
export const COVERITY_AUTOMATION_PRCOMMENT = getInput(constants.COVERITY_AUTOMATION_PRCOMMENT_KEY)

// Blackduck related inputs
export const BLACKDUCK_URL = getInput(constants.BLACKDUCK_URL_KEY)
export const BLACKDUCK_API_TOKEN = getInput(constants.BLACKDUCK_API_TOKEN_KEY)
export const BLACKDUCK_INSTALL_DIRECTORY = getInput(constants.BLACKDUCK_INSTALL_DIRECTORY_KEY)
export const BLACKDUCK_SCAN_FULL = getInput(constants.BLACKDUCK_SCAN_FULL_KEY)
export const BLACKDUCK_SCAN_FAILURE_SEVERITIES = getInput(constants.BLACKDUCK_SCAN_FAILURE_SEVERITIES_KEY)
export const BLACKDUCK_AUTOMATION_FIXPR = getInput(constants.BLACKDUCK_AUTOMATION_FIXPR_KEY)
export const BLACKDUCK_AUTOMATION_PRCOMMENT = getInput(constants.BLACKDUCK_AUTOMATION_PRCOMMENT_KEY)

export const GITHUB_TOKEN = getInput(constants.GITHUB_TOKEN_KEY)
