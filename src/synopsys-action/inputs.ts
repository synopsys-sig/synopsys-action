import {getInput} from '@actions/core'

export const SYNOPSYS_BRIDGE_PATH = getInput('synopsys_bridge_path')

//Bridge download url
export const BRIDGE_DOWNLOAD_URL = getInput('bridge_download_url')

// Polaris related inputs
export const POLARIS_ACCESS_TOKEN = getInput('polaris_accessToken')
export const POLARIS_APPLICATION_NAME = getInput('polaris_application_name')
export const POLARIS_PROJECT_NAME = getInput('polaris_project_name')
export const POLARIS_ASSESSMENT_TYPES = getInput('polaris_assessment_types')
export const POLARIS_SERVER_URL = getInput('polaris_serverUrl')

// Coverity related inputs
export const COVERITY_URL = getInput('coverity_url')
export const COVERITY_USER = getInput('coverity_user')
export const COVERITY_PASSPHRASE = getInput('coverity_passphrase')
export const COVERITY_PROJECT_NAME = getInput('coverity_project_name')
export const COVERITY_STREAM_NAME = getInput('coverity_stream_name')
export const COVERITY_INSTALL_DIRECTORY = getInput('coverity_install_directory')
export const COVERITY_POLICY_VIEW = getInput('coverity_policy_view')
export const COVERITY_REPOSITORY_NAME = getInput('coverity_repository_name')
export const COVERITY_BRANCH_NAME = getInput('coverity_branch_name')

// Blackduck related inputs
export const BLACKDUCK_URL = getInput('blackduck_url')
export const BLACKDUCK_API_TOKEN = getInput('blackduck_apiToken')
export const BLACKDUCK_INSTALL_DIRECTORY = getInput('blackduck_install_directory')
export const BLACKDUCK_SCAN_FULL = getInput('blackduck_scan_full')
