export const SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC = '/synopsys-bridge' //Path will be in home
export const SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS = '\\synopsys-bridge'
export const SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX = '/synopsys-bridge'
export const SYNOPSYS_BRIDGE_ARTIFACTORY_URL = 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-bridge/'

export const APPLICATION_NAME = 'synopsys-action'

export const SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY = 'synopsys_bridge_install_directory'
/**
 * @deprecated Use synopsys_bridge_download_url instead. This can be removed in future release.
 */
export const BRIDGE_DOWNLOAD_URL_KEY = 'bridge_download_url'
export const SYNOPSYS_BRIDGE_DOWNLOAD_URL_KEY = 'synopsys_bridge_download_url'
/**
 * @deprecated Use synopsys_bridge_download_version instead. This can be removed in future release.
 */
export const BRIDGE_DOWNLOAD_VERSION_KEY = 'bridge_download_version'
export const SYNOPSYS_BRIDGE_DOWNLOAD_VERSION_KEY = 'synopsys_bridge_download_version'

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
/**
 * @deprecated Use coverity_prComment_enabled instead. This can be removed in future release.
 */
export const COVERITY_AUTOMATION_PRCOMMENT_KEY = 'coverity_automation_prcomment'
export const COVERITY_PRCOMMENT_ENABLED_KEY = 'coverity_prComment_enabled'
export const COVERITY_LOCAL_KEY = 'coverity_local'
export const BRIDGE_COVERITY_VERSION_KEY = 'bridge_coverity_version'
export const COVERITY_VERSION_KEY = 'coverity_version'

// Polaris
/**
 * @deprecated Use polaris_access_token instead. This can be removed in future release.
 */
export const POLARIS_ACCESSTOKEN_KEY = 'polaris_accessToken'
export const POLARIS_ACCESS_TOKEN_KEY = 'polaris_access_token'
export const POLARIS_APPLICATION_NAME_KEY = 'polaris_application_name'
export const POLARIS_PROJECT_NAME_KEY = 'polaris_project_name'
export const POLARIS_ASSESSMENT_TYPES_KEY = 'polaris_assessment_types'
/**
 * @deprecated Use polaris_server_url instead. This can be removed in future release.
 */
export const POLARIS_SERVERURL_KEY = 'polaris_serverUrl'
export const POLARIS_SERVER_URL_KEY = 'polaris_server_url'
export const POLARIS_TRIAGE_KEY = 'polaris_triage'
export const POLARIS_PRCOMMENT_ENABLED_KEY = 'polaris_prComment_enabled'
export const POLARIS_PRCOMMENT_SEVERITIES_KEY = 'polaris_prComment_severities'
export const POLARIS_BRANCH_NAME_KEY = 'polaris_branch_name'
export const POLARIS_BRANCH_PARENT_NAME_KEY = 'polaris_branch_parent_name'

// Blackduck
export const BLACKDUCK_URL_KEY = 'blackduck_url'
export const BLACKDUCK_API_TOKEN_KEY = 'blackduck_apiToken'
export const BLACKDUCK_TOKEN_KEY = 'blackduck_token'
export const BLACKDUCK_INSTALL_DIRECTORY_KEY = 'blackduck_install_directory'
export const BLACKDUCK_SCAN_FULL_KEY = 'blackduck_scan_full'
export const BLACKDUCK_SCAN_FAILURE_SEVERITIES_KEY = 'blackduck_scan_failure_severities'
export const BLACKDUCK_AUTOMATION_FIXPR_KEY = 'blackduck_automation_fixpr'
export const BLACKDUCK_FIXPR_ENABLED_KEY = 'blackduck_fixpr_enabled'
export const BLACKDUCK_FIXPR_MAXCOUNT_KEY = 'blackduck_fixpr_maxCount'
export const BLACKDUCK_FIXPR_CREATE_SINGLE_PR_KEY = 'blackduck_fixpr_createSinglePR'
export const BLACKDUCK_FIXPR_FILTER_SEVERITIES_KEY = 'blackduck_fixpr_filter_severities'
export const BLACKDUCK_FIXPR_USE_UPGRADE_GUIDANCE_KEY = 'blackduck_fixpr_useUpgradeGuidance'
/**
 * @deprecated Use blackduck_prComment_enabled instead. This can be removed in future release.
 */
export const BLACKDUCK_AUTOMATION_PRCOMMENT_KEY = 'blackduck_automation_prcomment'
export const BLACKDUCK_PRCOMMENT_ENABLED_KEY = 'blackduck_prComment_enabled'

export const GITHUB_HOST_URL_KEY = 'github_host_url'
export const GITHUB_TOKEN_KEY = 'github_token'
export const INCLUDE_DIAGNOSTICS_KEY = 'include_diagnostics'
export const BRIDGE_NETWORK_AIRGAP_KEY = 'bridge_network_airgap'
export const NETWORK_AIRGAP_KEY = 'network_airgap'
export const DIAGNOSTICS_RETENTION_DAYS_KEY = 'diagnostics_retention_days'

// Bridge Exit Codes
export let EXIT_CODE_MAP = new Map<string, string>([
  ['0', 'Bridge execution successfully completed'],
  ['1', 'Undefined error, check error logs'],
  ['2', 'Error from adapter end'],
  ['3', 'Failed to shutdown the bridge'],
  ['8', 'The config option bridge.break has been set to true'],
  ['9', 'Bridge initialization failed']
])

export const RETRY_DELAY_IN_MILLISECONDS = 15000
export const RETRY_COUNT = 3
export const NON_RETRY_HTTP_CODES = new Set([200, 201, 401, 403, 416])
export const GITHUB_CLOUD_URL = 'https://github.com'
export const REPORTS_SARIF_CREATE_KEY = 'reports_sarif_create'
export const REPORTS_SARIF_FILE_PATH_KEY = 'reports_sarif_file_path'
export const REPORTS_SARIF_ISSUE_TYPES_KEY = 'reports_sarif_issue_types'
export const REPORTS_SARIF_SEVERITIES_KEY = 'reports_sarif_severities'


export const GITHUB_ENVIRONMENT_VARIABLES = {
  GITHUB_TOKEN: 'GITHUB_TOKEN',
  GITHUB_REPOSITORY: 'GITHUB_REPOSITORY',
  GITHUB_HEAD_REF: 'GITHUB_HEAD_REF',
  GITHUB_REF: 'GITHUB_REF',
  GITHUB_REF_NAME: 'GITHUB_REF_NAME',
  GITHUB_REPOSITORY_OWNER: 'GITHUB_REPOSITORY_OWNER',
  GITHUB_BASE_REF: 'GITHUB_BASE_REF',
  GITHUB_EVENT_NAME: 'GITHUB_EVENT_NAME',
  GITHUB_SERVER_URL: 'GITHUB_SERVER_URL',
  GITHUB_SHA: 'GITHUB_SHA'
}
