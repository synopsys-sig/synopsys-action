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
export const MIN_SUPPORTED_SYNOPSYS_BRIDGE_MAC_ARM_VERSION = '2.1.0'

// Scan Types
export const COVERITY_KEY = 'coverity'
export const POLARIS_KEY = 'polaris'
export const BLACKDUCK_KEY = 'blackduck'
export const SRM_KEY = 'SRM'

// Srm
export const SRM_URL_KEY = 'srm_url'
export const SRM_API_KEY = 'srm_apikey'
export const SRM_ASSESSMENT_TYPES_KEY = 'srm_assessment_types'
export const SRM_PROJECT_NAME_KEY = 'srm_project_name'
export const SRM_PROJECT_ID_KEY = 'srm_project_id'
export const SRM_BRANCH_NAME_KEY = 'srm_branch_name'
export const SRM_BRANCH_PARENT_KEY = 'srm_branch_parent'
export const SRM_WAITFORSCAN_KEY = 'srm_waitForScan'
export const COVERITY_EXECUTION_PATH_KEY = 'coverity_execution_path'
export const BLACKDUCK_EXECUTION_PATH_KEY = 'blackduck_execution_path'

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
export const COVERITY_WAITFORSCAN_KEY = 'coverity_waitForScan'
export const COVERITY_BUILD_COMMAND_KEY = 'coverity_build_command'
export const COVERITY_CLEAN_COMMAND_KEY = 'coverity_clean_command'
export const COVERITY_CONFIG_PATH_KEY = 'coverity_config_path'
export const COVERITY_ARGS_KEY = 'coverity_args'
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
export const POLARIS_TEST_SCA_TYPE_KEY = 'polaris_test_sca_type'
export const POLARIS_REPORTS_SARIF_CREATE_KEY = 'polaris_reports_sarif_create'
export const POLARIS_REPORTS_SARIF_FILE_PATH_KEY = 'polaris_reports_sarif_file_path'
export const POLARIS_REPORTS_SARIF_SEVERITIES_KEY = 'polaris_reports_sarif_severities'
export const POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES_KEY = 'polaris_reports_sarif_groupSCAIssues'
export const POLARIS_REPORTS_SARIF_ISSUE_TYPES_KEY = 'polaris_reports_sarif_issue_types'
export const POLARIS_UPLOAD_SARIF_REPORT_KEY = 'polaris_upload_sarif_report'
export const POLARIS_WAITFORSCAN_KEY = 'polaris_waitForScan'
export const POLARIS_ASSESSMENT_MODE_KEY = 'polaris_assessment_mode'
export const PROJECT_SOURCE_ARCHIVE_KEY = 'project_source_archive'
export const PROJECT_SOURCE_PRESERVESYMLINKS_KEY = 'project_source_preserveSymLinks'
export const PROJECT_SOURCE_EXCLUDES_KEY = 'project_source_excludes'
export const PROJECT_DIRECTORY_KEY = 'project_directory'

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
export const BLACKDUCK_REPORTS_SARIF_CREATE_KEY = 'blackduck_reports_sarif_create'
export const BLACKDUCK_REPORTS_SARIF_FILE_PATH_KEY = 'blackduck_reports_sarif_file_path'
export const BLACKDUCK_REPORTS_SARIF_SEVERITIES_KEY = 'blackduck_reports_sarif_severities'
export const BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES_KEY = 'blackduck_reports_sarif_groupSCAIssues'
export const BLACKDUCK_UPLOAD_SARIF_REPORT_KEY = 'blackduck_upload_sarif_report'
export const BLACKDUCK_WAITFORSCAN_KEY = 'blackduck_waitForScan'
export const BLACKDUCK_SEARCH_DEPTH_KEY = 'blackduck_search_depth'
export const BLACKDUCK_CONFIG_PATH_KEY = 'blackduck_config_path'
export const BLACKDUCK_ARGS_KEY = 'blackduck_args'
export const BLACKDUCK_POLICY_BADGES_CREATE_KEY = 'blackduck_policy_badges_create'
export const BLACKDUCK_POLICY_BADGES_MAX_COUNT_KEY = 'blackduck_policy_badges_maxCount'

export const GITHUB_HOST_URL_KEY = 'github_host_url'
export const GITHUB_TOKEN_KEY = 'github_token'
export const INCLUDE_DIAGNOSTICS_KEY = 'include_diagnostics'
export const BRIDGE_NETWORK_AIRGAP_KEY = 'bridge_network_airgap'
export const NETWORK_AIRGAP_KEY = 'network_airgap'
export const DIAGNOSTICS_RETENTION_DAYS_KEY = 'diagnostics_retention_days'

// Bridge Exit Codes
export const EXIT_CODE_MAP = new Map<string, string>([
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
export const GITHUB_CLOUD_API_URL = 'https://api.github.com'
export const BRIDGE_LOCAL_DIRECTORY = '.bridge'
export const BLACKDUCK_SARIF_GENERATOR_DIRECTORY = 'Blackduck SARIF Generator'
export const BLACKDUCK_SARIF_ARTIFACT_NAME = 'blackduck_sarif_report'
export const POLARIS_SARIF_GENERATOR_DIRECTORY = 'Polaris SARIF Generator'
export const POLARIS_SARIF_ARTIFACT_NAME = 'polaris_sarif_report'
export const SARIF_DEFAULT_FILE_NAME = 'report.sarif.json'
export const X_RATE_LIMIT_RESET = 'x-ratelimit-reset'
export const X_RATE_LIMIT_REMAINING = 'x-ratelimit-remaining'
export const SECONDARY_RATE_LIMIT = 'secondary rate limit'
export const HTTP_STATUS_OK = 200
export const HTTP_STATUS_ACCEPTED = 202
export const HTTP_STATUS_FORBIDDEN = 403

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
  GITHUB_SHA: 'GITHUB_SHA',
  GITHUB_API_URL: 'GITHUB_API_URL'
}
export const GITHUB_TOKEN_VALIDATION_SARIF_UPLOAD_ERROR = 'Missing required GitHub token for uploading SARIF report to GitHub Advanced Security'
export const SARIF_REPORT_LOG_INFO_FOR_PR_SCANS = 'SARIF report create/upload is ignored for pull request scan'
export const POLARIS_PR_COMMENT_LOG_INFO_FOR_NON_PR_SCANS = 'Polaris PR Comment is ignored for non pull request scan'
export const COVERITY_PR_COMMENT_LOG_INFO_FOR_NON_PR_SCANS = 'Coverity PR Comment is ignored for non pull request scan'
export const BLACKDUCK_PR_COMMENT_LOG_INFO_FOR_NON_PR_SCANS = 'Black Duck PR Comment is ignored for non pull request scan'
export const BLACKDUCK_FIXPR_LOG_INFO_FOR_PR_SCANS = 'Black Duck Fix PR is ignored for pull request scan'
export const MISSING_GITHUB_TOKEN_FOR_FIX_PR_AND_PR_COMMENT = 'Missing required github token for fix pull request/pull request comments/Github Badges'
