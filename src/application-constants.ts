export const SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC = '/synopsys-bridge' //Path will be in home
export const SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS = '\\synopsys-bridge'
export const SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX = '/synopsys-bridge'
export const SYNOPSYS_BRIDGE_ARTIFACTORY_URL = 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-bridge/'

export const APPLICATION_NAME = 'synopsys-action'

export const SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY = 'synopsys_bridge_install_directory'

// Scan Types
export const COVERITY_KEY = 'coverity'
export const POLARIS_KEY = 'polaris'
export const BLACKDUCK_KEY = 'blackduck'

// Coverity
export const COVERITY_URL_KEY = 'coverity_url'
export const COVERITY_USER_KEY = 'coverity_user'
export const COVERITY_PASSPHRASE_KEY = 'coverity_passphrase'
export const COVERITY_PROJECT_NAME_KEY = 'coverity_project_name'
export const COVERITY_STREAM_NAME_KEY = 'coverity_stream_name'
export const COVERITY_INSTALL_DIRECTORY_KEY = 'coverity_install_directory'
export const COVERITY_POLICY_VIEW_KEY = 'coverity_policy_view'
export const COVERITY_REPOSITORY_NAME_KEY = 'coverity_repository_name'
export const COVERITY_BRANCH_NAME_KEY = 'coverity_branch_name'
export const COVERITY_AUTOMATION_PRCOMMENT_KEY = 'coverity_automation_prcomment'
export const COVERITY_LOCAL_KEY = 'coverity_local'
export const COVERITY_VERSION_KEY = 'bridge_coverity_version'

// Polaris
export const POLARIS_ACCESS_TOKEN_KEY = 'polaris_accessToken'
export const POLARIS_APPLICATION_NAME_KEY = 'polaris_application_name'
export const POLARIS_PROJECT_NAME_KEY = 'polaris_project_name'
export const POLARIS_ASSESSMENT_TYPES_KEY = 'polaris_assessment_types'
export const POLARIS_SERVER_URL_KEY = 'polaris_serverUrl'

// Blackduck
export const BLACKDUCK_URL_KEY = 'blackduck_url'
export const BLACKDUCK_API_TOKEN_KEY = 'blackduck_apiToken'
export const BLACKDUCK_INSTALL_DIRECTORY_KEY = 'blackduck_install_directory'
export const BLACKDUCK_SCAN_FULL_KEY = 'blackduck_scan_full'
export const BLACKDUCK_SCAN_FAILURE_SEVERITIES_KEY = 'blackduck_scan_failure_severities'
export const BLACKDUCK_AUTOMATION_FIXPR_KEY = 'blackduck_automation_fixpr'
export const BLACKDUCK_AUTOMATION_PRCOMMENT_KEY = 'blackduck_automation_prcomment'
export const BLACKDUCK_FIXPR_ENABLED_KEY = 'bridge_blackduck_fixpr_enabled'
export const BLACKDUCK_FIXPR_MAXCOUNT_KEY = 'bridge_blackduck_fixpr_maxCount'
export const BLACKDUCK_FIXPR_CREATE_SINGLE_PR_KEY = 'bridge_blackduck_fixpr_createSinglePR'
export const BLACKDUCK_FIXPR_FILTER_BY_KEY = 'bridge_blackduck_fixpr_filter_by'
export const BLACKDUCK_FIXPR_FILTER_SEVERITIES_KEY = 'bridge_blackduck_fixpr_filter_severities'
export const BLACKDUCK_FIXPR_LONG_TERM_GUIDANCE_KEY = 'bridge_blackduck_fixpr_useLongTermUpgradeGuidance'

export const GITHUB_TOKEN_KEY = 'github_token'
export const INCLUDE_DIAGNOSTICS_KEY = 'include_diagnostics'
export const NETWORK_AIRGAP_KEY = 'bridge_network_airgap'
export const DIAGNOSTICS_RETENTION_DAYS_KEY = 'diagnostics_retention_days'
export const SEVERITIES = 'SEVERITIES'

// Bridge Exit Codes
export let EXIT_CODE_MAP = new Map<string, string>([
  ['0', 'Bridge execution successfully completed'],
  ['1', 'Undefined error, check error logs'],
  ['2', 'Error from adapter end'],
  ['3', 'Failed to shutdown the bridge'],
  ['8', 'The config option bridge.break has been set to true'],
  ['9', 'Bridge initialization failed']
])
