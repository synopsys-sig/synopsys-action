import {getInput} from '@actions/core'

export const SYNOPSYS_BRIDGE_PATH = getInput('synopsys-bridge-path')

// Polaris related inputs
export const POLARIS_ACCESS_TOKEN = getInput('polaris-access-token')
export const POLARIS_APPLICATION_NAME = getInput('polaris-application-name')
export const POLARIS_PROJECT_NAME = getInput('polaris-project-name')
export const POLARIS_ASSESSMENT_TYPES = getInput('polaris-assessment-types')
export const POLARIS_SERVER_URL = getInput('polaris-server-url')
export const COVERITY_URL = getInput('coverity-url')
export const COVERITY_USER = getInput('coverity-user')
export const COVERITY_PASSPHRASE = getInput('coverity-pasphrase')
