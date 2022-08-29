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
