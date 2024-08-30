import * as fs from 'fs'
import path from 'path'
import {debug, info} from '@actions/core'
import {isNullOrEmptyValue, validateBlackduckFailureSeverities, validateCoverityInstallDirectoryParam} from './validators'
import * as inputs from './inputs'
import {Polaris} from './input-data/polaris'
import {InputData} from './input-data/input-data'
import {Coverity, CoverityArbitrary} from './input-data/coverity'
import {Blackduck, BLACKDUCK_SCAN_FAILURE_SEVERITIES, BlackDuckArbitrary, BlackDuckFixPrData} from './input-data/blackduck'
import {GithubData} from './input-data/github'
import * as constants from '../application-constants'
import {isBoolean, isPullRequestEvent, parseToBoolean} from './utility'
import {SRM} from './input-data/srm'

export class SynopsysToolsParameter {
  tempDir: string
  private static STAGE_OPTION = '--stage'
  static DIAGNOSTICS_OPTION = '--diagnostics'
  private static INPUT_OPTION = '--input'
  private static POLARIS_STAGE = 'polaris'
  private static POLARIS_STATE_FILE_NAME = 'polaris_input.json'
  private static COVERITY_STATE_FILE_NAME = 'coverity_input.json'
  private static BD_STATE_FILE_NAME = 'bd_input.json'
  private static SRM_STATE_FILE_NAME = 'srm_input.json'
  private static SRM_STAGE = 'srm'
  // Coverity parameters
  private static COVERITY_STAGE = 'connect'
  static SPACE = ' '
  // Blackduck parameters
  private static BLACKDUCK_STAGE = 'blackduck'

  constructor(tempDir: string) {
    this.tempDir = tempDir
  }

  getFormattedCommandForPolaris(githubRepoName: string): string {
    let command = ''
    const assessmentTypeArray: string[] = []
    if (inputs.POLARIS_ASSESSMENT_TYPES) {
      // converting provided assessmentTypes to uppercase
      const assessmentTypes = inputs.POLARIS_ASSESSMENT_TYPES.toUpperCase().split(',')
      for (const assessmentType of assessmentTypes) {
        const regEx = new RegExp('^[a-zA-Z]+$')
        if (assessmentType.trim() && regEx.test(assessmentType.trim())) {
          assessmentTypeArray.push(assessmentType.trim())
        } else {
          throw new Error('Invalid value for '.concat(constants.POLARIS_ASSESSMENT_TYPES_KEY))
        }
      }
    }

    let projectName = inputs.POLARIS_PROJECT_NAME
    if (isNullOrEmptyValue(projectName)) {
      projectName = githubRepoName
    }

    let applicationName = inputs.POLARIS_APPLICATION_NAME
    if (isNullOrEmptyValue(applicationName)) {
      applicationName = githubRepoName
    }
    debug(`Polaris application name: ${applicationName}`)
    debug(`Polaris project name: ${projectName}`)

    const polData: InputData<Polaris> = {
      data: {
        polaris: {
          accesstoken: inputs.POLARIS_ACCESS_TOKEN,
          serverUrl: inputs.POLARIS_SERVER_URL,
          application: {name: applicationName},
          project: {name: projectName},
          assessment: {
            types: assessmentTypeArray,
            ...(inputs.POLARIS_ASSESSMENT_MODE && {
              mode: inputs.POLARIS_ASSESSMENT_MODE
            })
          }
        }
      }
    }

    if (inputs.POLARIS_TRIAGE) {
      polData.data.polaris.triage = inputs.POLARIS_TRIAGE
    }
    if (inputs.POLARIS_BRANCH_NAME) {
      polData.data.polaris.branch = {name: inputs.POLARIS_BRANCH_NAME}
    }
    if (inputs.POLARIS_TEST_SCA_TYPE) {
      polData.data.polaris.test = {
        sca: {
          type: inputs.POLARIS_TEST_SCA_TYPE
        }
      }
    }

    if (isBoolean(inputs.POLARIS_WAITFORSCAN)) {
      polData.data.polaris.waitForScan = parseToBoolean(inputs.POLARIS_WAITFORSCAN)
    }

    if (inputs.PROJECT_DIRECTORY || inputs.PROJECT_SOURCE_ARCHIVE || inputs.PROJECT_SOURCE_EXCLUDES || inputs.PROJECT_SOURCE_PRESERVESYMLINKS) {
      polData.data.project = {}

      if (inputs.PROJECT_DIRECTORY) {
        polData.data.project.directory = inputs.PROJECT_DIRECTORY
      }

      if (inputs.PROJECT_SOURCE_ARCHIVE || inputs.PROJECT_SOURCE_EXCLUDES || inputs.PROJECT_SOURCE_PRESERVESYMLINKS) {
        polData.data.project.source = {}

        if (inputs.PROJECT_SOURCE_ARCHIVE) {
          polData.data.project.source.archive = inputs.PROJECT_SOURCE_ARCHIVE
        }

        if (inputs.PROJECT_SOURCE_PRESERVESYMLINKS) {
          polData.data.project.source.preserveSymLinks = parseToBoolean(inputs.PROJECT_SOURCE_PRESERVESYMLINKS)
        }

        if (inputs.PROJECT_SOURCE_EXCLUDES) {
          const sourceExcludesList: string[] = inputs.PROJECT_SOURCE_EXCLUDES.split(',').map(sourceExclude => sourceExclude.trim())
          polData.data.project.source.excludes = sourceExcludesList
        }
      }
    }

    const isPrEvent = isPullRequestEvent()
    if (parseToBoolean(inputs.POLARIS_PRCOMMENT_ENABLED)) {
      if (isPrEvent) {
        /** Set Polaris PR comment inputs in case of PR context */
        info('Polaris PR comment is enabled')
        if (inputs.POLARIS_PARENT_BRANCH_NAME) {
          polData.data.polaris.branch = {
            ...(inputs.POLARIS_BRANCH_NAME && {name: inputs.POLARIS_BRANCH_NAME}),
            parent: {
              name: inputs.POLARIS_PARENT_BRANCH_NAME
            }
          }
        }
        const prCommentSeverities: string[] = []
        const inputPrCommentSeverities = inputs.POLARIS_PRCOMMENT_SEVERITIES
        if (inputPrCommentSeverities != null && inputPrCommentSeverities.length > 0) {
          const severityValues = inputPrCommentSeverities.split(',')
          for (const severity of severityValues) {
            if (severity.trim()) {
              prCommentSeverities.push(severity.trim())
            }
          }
        }
        polData.data.polaris.prComment = {
          enabled: true,
          ...(prCommentSeverities.length > 0 && {severities: prCommentSeverities})
        }
        polData.data.github = this.getGithubRepoInfo()
      } else {
        /** Log info if Polaris PR comment is enabled in case of non PR context */
        info(constants.POLARIS_PR_COMMENT_LOG_INFO_FOR_NON_PR_SCANS)
      }
    }

    if (!isPrEvent) {
      if (parseToBoolean(inputs.POLARIS_REPORTS_SARIF_CREATE)) {
        /** Set Polaris SARIF inputs in case of non PR context */
        const sarifReportFilterSeverities: string[] = []
        const sarifReportFilterAssessmentIssuesType: string[] = []

        if (inputs.POLARIS_REPORTS_SARIF_SEVERITIES) {
          const filterSeverities = inputs.POLARIS_REPORTS_SARIF_SEVERITIES.split(',')
          for (const sarifSeverity of filterSeverities) {
            if (sarifSeverity) {
              sarifReportFilterSeverities.push(sarifSeverity.trim())
            }
          }
        }

        if (inputs.POLARIS_REPORTS_SARIF_ISSUE_TYPES) {
          const filterIssueTypes = inputs.POLARIS_REPORTS_SARIF_ISSUE_TYPES.split(',')
          for (const issueType of filterIssueTypes) {
            if (issueType) {
              sarifReportFilterAssessmentIssuesType.push(issueType.trim())
            }
          }
        }
        polData.data.polaris.reports = {
          sarif: {
            create: true,
            ...(inputs.POLARIS_REPORTS_SARIF_SEVERITIES && {
              severities: sarifReportFilterSeverities
            }),
            ...(inputs.POLARIS_REPORTS_SARIF_FILE_PATH && {
              file: {
                path: inputs.POLARIS_REPORTS_SARIF_FILE_PATH.trim()
              }
            }),
            ...(inputs.POLARIS_REPORTS_SARIF_ISSUE_TYPES && {
              issue: {
                types: sarifReportFilterAssessmentIssuesType
              }
            }),
            groupSCAIssues: isBoolean(inputs.POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES) ? JSON.parse(inputs.POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES) : true
          }
        }
      }
      if (parseToBoolean(inputs.POLARIS_UPLOAD_SARIF_REPORT) && isNullOrEmptyValue(inputs.GITHUB_TOKEN)) {
        /** Throw error if SARIF upload is enabled but GitHub token is empty */
        throw new Error(constants.GITHUB_TOKEN_VALIDATION_SARIF_UPLOAD_ERROR)
      }
    } else {
      if (parseToBoolean(inputs.POLARIS_REPORTS_SARIF_CREATE) || parseToBoolean(inputs.POLARIS_UPLOAD_SARIF_REPORT)) {
        /** Log info if SARIF create is enabled in PR context */
        info(constants.SARIF_REPORT_LOG_INFO_FOR_PR_SCANS)
      }
    }

    // Set Coverity or Blackduck Arbitrary Arguments
    polData.data.coverity = this.setCoverityArbitraryArgs()
    polData.data.blackduck = this.setBlackDuckArbitraryArgs()

    const inputJson = JSON.stringify(polData)
    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.POLARIS_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.POLARIS_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  getFormattedCommandForCoverity(githubRepoName: string): string {
    let command = ''
    let coverityStreamName = inputs.COVERITY_STREAM_NAME
    const isPrEvent = isPullRequestEvent()

    if (isNullOrEmptyValue(coverityStreamName)) {
      const defaultStreamName = (isPrEvent ? process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_BASE_REF] : process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF_NAME]) || ''
      coverityStreamName = githubRepoName.concat('-').concat(defaultStreamName)
    }

    let coverityProjectName = inputs.COVERITY_PROJECT_NAME
    if (isNullOrEmptyValue(coverityProjectName)) {
      coverityProjectName = githubRepoName
    }
    debug(`Coverity project name: ${coverityProjectName}`)
    debug(`Coverity stream name: ${coverityStreamName}`)

    const covData: InputData<Coverity> = {
      data: {
        coverity: {
          connect: {
            user: {name: inputs.COVERITY_USER, password: inputs.COVERITY_PASSPHRASE},
            url: inputs.COVERITY_URL,
            project: {name: coverityProjectName},
            stream: {name: coverityStreamName}
          }
        }
      }
    }

    if (inputs.COVERITY_LOCAL) {
      covData.data.coverity.local = true
    }

    if (inputs.COVERITY_INSTALL_DIRECTORY) {
      if (validateCoverityInstallDirectoryParam(inputs.COVERITY_INSTALL_DIRECTORY)) {
        covData.data.coverity.install = {directory: inputs.COVERITY_INSTALL_DIRECTORY}
      }
    }

    if (inputs.COVERITY_POLICY_VIEW) {
      covData.data.coverity.connect.policy = {view: inputs.COVERITY_POLICY_VIEW}
    }

    if (isBoolean(inputs.COVERITY_WAITFORSCAN)) {
      covData.data.coverity.waitForScan = parseToBoolean(inputs.COVERITY_WAITFORSCAN)
    }

    if (inputs.COVERITY_REPOSITORY_NAME || inputs.COVERITY_BRANCH_NAME || inputs.PROJECT_DIRECTORY) {
      covData.data.project = {
        ...(inputs.COVERITY_REPOSITORY_NAME && {
          repository: {
            name: inputs.COVERITY_REPOSITORY_NAME
          }
        }),
        ...(inputs.COVERITY_BRANCH_NAME && {
          branch: {
            name: inputs.COVERITY_BRANCH_NAME
          }
        }),
        ...(inputs.PROJECT_DIRECTORY && {
          directory: inputs.PROJECT_DIRECTORY
        })
      }
    }

    if (inputs.COVERITY_VERSION) {
      covData.data.coverity.version = inputs.COVERITY_VERSION
    }

    if (parseToBoolean(inputs.COVERITY_PRCOMMENT_ENABLED)) {
      if (isPrEvent) {
        /** Set Coverity PR comment inputs in case of PR context */
        info('Coverity PR comment is enabled')
        covData.data.github = this.getGithubRepoInfo()
        covData.data.coverity.automation = {prcomment: true}
      } else {
        /** Log info if Coverity PR comment is enabled in case of non PR context */
        info(constants.COVERITY_PR_COMMENT_LOG_INFO_FOR_NON_PR_SCANS)
      }
    }

    if (isBoolean(inputs.ENABLE_NETWORK_AIR_GAP)) {
      covData.data.network = {airGap: parseToBoolean(inputs.ENABLE_NETWORK_AIR_GAP)}
    }

    covData.data.coverity = Object.assign({}, this.setCoverityArbitraryArgs(), covData.data.coverity)

    const inputJson = JSON.stringify(covData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.COVERITY_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.COVERITY_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  getFormattedCommandForBlackduck(): string {
    const failureSeverities: string[] = []

    if (inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES != null && inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES.length > 0) {
      try {
        const failureSeveritiesInput = inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES
        if (failureSeveritiesInput != null && failureSeveritiesInput.length > 0) {
          const failureSeveritiesArray = failureSeveritiesInput.toUpperCase().split(',')
          for (const failureSeverity of failureSeveritiesArray) {
            if (failureSeverity.trim().length > 0) {
              failureSeverities.push(failureSeverity.trim())
            }
          }
        }
      } catch (error) {
        throw new Error('Invalid value for '.concat(constants.BLACKDUCK_SCAN_FAILURE_SEVERITIES_KEY))
      }
    }
    let command = ''
    const blackduckData: InputData<Blackduck> = {
      data: {
        blackduck: {
          url: inputs.BLACKDUCK_URL,
          token: inputs.BLACKDUCK_API_TOKEN
        }
      }
    }

    if (inputs.BLACKDUCK_INSTALL_DIRECTORY) {
      blackduckData.data.blackduck.install = {directory: inputs.BLACKDUCK_INSTALL_DIRECTORY}
    }

    if (inputs.BLACKDUCK_SCAN_FULL) {
      let scanFullValue = false
      if (inputs.BLACKDUCK_SCAN_FULL.toLowerCase() === 'true' || inputs.BLACKDUCK_SCAN_FULL.toLowerCase() === 'false') {
        scanFullValue = inputs.BLACKDUCK_SCAN_FULL.toLowerCase() === 'true'
      } else {
        throw new Error('Missing boolean value for '.concat(constants.BLACKDUCK_SCAN_FULL_KEY))
      }
      blackduckData.data.blackduck.scan = {full: scanFullValue}
    }

    if (failureSeverities && failureSeverities.length > 0) {
      validateBlackduckFailureSeverities(failureSeverities)
      const failureSeverityEnums: BLACKDUCK_SCAN_FAILURE_SEVERITIES[] = []
      for (const failureSeverity of failureSeverities) {
        if (!Object.values(BLACKDUCK_SCAN_FAILURE_SEVERITIES).includes(failureSeverity as BLACKDUCK_SCAN_FAILURE_SEVERITIES)) {
          throw new Error('Invalid value for '.concat(constants.BLACKDUCK_SCAN_FAILURE_SEVERITIES_KEY))
        } else {
          failureSeverityEnums.push(BLACKDUCK_SCAN_FAILURE_SEVERITIES[failureSeverity as keyof typeof BLACKDUCK_SCAN_FAILURE_SEVERITIES])
        }
      }

      if (blackduckData.data.blackduck.scan) {
        blackduckData.data.blackduck.scan.failure = {severities: failureSeverityEnums}
      } else {
        blackduckData.data.blackduck.scan = {failure: {severities: failureSeverityEnums}}
      }
    }

    if (isBoolean(inputs.BLACKDUCK_WAITFORSCAN)) {
      blackduckData.data.blackduck.waitForScan = parseToBoolean(inputs.BLACKDUCK_WAITFORSCAN)
    }

    if (inputs.PROJECT_DIRECTORY) {
      blackduckData.data.project = {
        directory: inputs.PROJECT_DIRECTORY
      }
    }

    const isPrEvent = isPullRequestEvent()
    if (parseToBoolean(inputs.BLACKDUCK_PRCOMMENT_ENABLED)) {
      if (isPrEvent) {
        /** Set Black Duck PR comment inputs in case of PR context */
        info('Black Duck PR comment is enabled')
        blackduckData.data.github = this.getGithubRepoInfo()
        blackduckData.data.blackduck.automation = {prcomment: true}
      } else {
        info(constants.BLACKDUCK_PR_COMMENT_LOG_INFO_FOR_NON_PR_SCANS)
      }
    }
    if (parseToBoolean(inputs.BLACKDUCK_FIXPR_ENABLED)) {
      if (!isPrEvent) {
        /** Set Black Duck Fix PR inputs in case of non PR context */
        info('Black Duck Fix PR is enabled')
        blackduckData.data.blackduck.fixpr = this.setBlackDuckFixPrInputs()
        blackduckData.data.github = this.getGithubRepoInfo()
      } else {
        info(constants.BLACKDUCK_FIXPR_LOG_INFO_FOR_PR_SCANS)
      }
    }
    if (!isPrEvent) {
      if (parseToBoolean(inputs.BLACKDUCK_REPORTS_SARIF_CREATE)) {
        /** Set Black Duck SARIF inputs in case of non PR context */
        const sarifReportFilterSeverities: string[] = []
        if (inputs.BLACKDUCK_REPORTS_SARIF_SEVERITIES) {
          const filterSeverities = inputs.BLACKDUCK_REPORTS_SARIF_SEVERITIES.split(',')
          for (const sarifSeverity of filterSeverities) {
            if (sarifSeverity) {
              sarifReportFilterSeverities.push(sarifSeverity.trim())
            }
          }
        }
        blackduckData.data.blackduck.reports = {
          sarif: {
            create: true,
            ...(inputs.BLACKDUCK_REPORTS_SARIF_SEVERITIES && {
              severities: sarifReportFilterSeverities
            }),
            ...(inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH && {
              file: {
                path: inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH.trim()
              }
            }),
            groupSCAIssues: isBoolean(inputs.BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES) ? JSON.parse(inputs.BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES) : true
          }
        }
      }
      if (parseToBoolean(inputs.BLACKDUCK_UPLOAD_SARIF_REPORT) && isNullOrEmptyValue(inputs.GITHUB_TOKEN)) {
        /** Throw error if SARIF upload is enabled but GitHub token is empty */
        throw new Error(constants.GITHUB_TOKEN_VALIDATION_SARIF_UPLOAD_ERROR)
      }
    } else {
      if (parseToBoolean(inputs.BLACKDUCK_REPORTS_SARIF_CREATE) || parseToBoolean(inputs.BLACKDUCK_UPLOAD_SARIF_REPORT)) {
        /** Log info if SARIF create/upload is enabled in PR context */
        info(constants.SARIF_REPORT_LOG_INFO_FOR_PR_SCANS)
      }
    }

    if (inputs.BLACKDUCK_POLICY_BADGES_CREATE) {
      blackduckData.data.blackduck.policy = {
        badges: {
          create: true,
          ...(Number.isInteger(parseInt(inputs.BLACKDUCK_POLICY_BADGES_MAX_COUNT)) && {
            maxCount: parseInt(inputs.BLACKDUCK_POLICY_BADGES_MAX_COUNT)
          })
        }
      }
      // Additional null check has been added to support avoid duplicate call to getGithubRepoInfo() when fix pr is enabled
      if (blackduckData.data.github == null) {
        blackduckData.data.github = this.getGithubRepoInfo()
      }
    }

    if (isBoolean(inputs.ENABLE_NETWORK_AIR_GAP)) {
      blackduckData.data.network = {airGap: parseToBoolean(inputs.ENABLE_NETWORK_AIR_GAP)}
    }

    blackduckData.data.blackduck = Object.assign({}, this.setBlackDuckArbitraryArgs(), blackduckData.data.blackduck)

    const inputJson = JSON.stringify(blackduckData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.BD_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.BLACKDUCK_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  getFormattedCommandForSRM(githubRepoName: string): string {
    let command = ''
    let assessmentTypes: string[] = []
    if (inputs.SRM_ASSESSMENT_TYPES) {
      assessmentTypes = inputs.SRM_ASSESSMENT_TYPES.split(',')
    }

    const srmData: InputData<SRM> = {
      data: {
        srm: {
          url: inputs.SRM_URL,
          apikey: inputs.SRM_API_KEY,
          assessment: {types: assessmentTypes}
        }
      }
    }

    if (inputs.SRM_BRANCH_NAME || inputs.SRM_BRANCH_PARENT) {
      srmData.data.srm.branch = {
        ...(inputs.SRM_BRANCH_NAME && {name: inputs.SRM_BRANCH_NAME}),
        ...(inputs.SRM_BRANCH_PARENT && {parent: inputs.SRM_BRANCH_PARENT})
      }
    }

    if (inputs.SRM_PROJECT_NAME || inputs.SRM_PROJECT_ID) {
      srmData.data.srm.project = {
        ...(inputs.SRM_PROJECT_NAME && {name: inputs.SRM_PROJECT_NAME}),
        ...(inputs.SRM_PROJECT_ID && {id: inputs.SRM_PROJECT_ID})
      }
    } else {
      debug(`SRM project name: ${githubRepoName}`)
      srmData.data.srm.project = {
        name: githubRepoName
      }
    }

    if (inputs.BLACKDUCK_EXECUTION_PATH) {
      srmData.data.blackduck = {
        execution: {
          path: inputs.BLACKDUCK_EXECUTION_PATH
        }
      }
    }

    if (inputs.COVERITY_EXECUTION_PATH) {
      srmData.data.coverity = {
        execution: {
          path: inputs.COVERITY_EXECUTION_PATH
        }
      }
    }

    if (isBoolean(inputs.SRM_WAITFORSCAN)) {
      srmData.data.srm.waitForScan = parseToBoolean(inputs.SRM_WAITFORSCAN)
    }

    if (inputs.PROJECT_DIRECTORY) {
      srmData.data.project = {
        directory: inputs.PROJECT_DIRECTORY
      }
    }

    // Set Coverity or Blackduck Arbitrary Arguments
    const coverityArgs = this.setCoverityArbitraryArgs()
    const blackduckArgs = this.setBlackDuckArbitraryArgs()

    if (Object.keys(coverityArgs).length > 0) {
      srmData.data.coverity = {...srmData.data.coverity, ...coverityArgs}
    }

    if (Object.keys(blackduckArgs).length > 0) {
      srmData.data.blackduck = {...srmData.data.blackduck, ...blackduckArgs}
    }

    const inputJson = JSON.stringify(srmData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.SRM_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.SRM_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  private getGithubRepoInfo(): GithubData | undefined {
    const githubToken = inputs.GITHUB_TOKEN
    const githubRepo = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY]
    const githubRepoName = githubRepo !== undefined ? githubRepo.substring(githubRepo.indexOf('/') + 1, githubRepo.length).trim() : ''
    const githubBranchName = this.getGithubBranchName()
    const githubRef = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF]
    const githubServerUrl = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SERVER_URL] || ''
    const githubHostUrl = githubServerUrl === constants.GITHUB_CLOUD_URL ? '' : githubServerUrl

    debug(`Github Repository: ${process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY]}`)
    debug(`Github Ref Name: ${process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF_NAME]}`)
    debug(`Github Head Ref: ${process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_HEAD_REF]}`)
    debug(`Github Ref: ${process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF]}`)
    debug(`Github Server Url: ${process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SERVER_URL]}`)

    // pr number will be part of "refs/pull/<pr_number>/merge"
    // if there is manual run without raising pr then GITHUB_REF will return refs/heads/branch_name
    const githubPrNumber = githubRef !== undefined ? githubRef.split('/')[2].trim() : ''
    const githubRepoOwner = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY_OWNER] || ''

    if (isNullOrEmptyValue(githubToken)) {
      throw new Error(constants.MISSING_GITHUB_TOKEN_FOR_FIX_PR_AND_PR_COMMENT)
    }

    // This condition is required as per ts-lint as these fields may have undefined as well
    if (githubRepoName != null && githubBranchName != null && githubRepoOwner != null) {
      return this.setGithubData(githubToken, githubRepoName, githubRepoOwner, githubBranchName, githubPrNumber, githubHostUrl)
    }
    return undefined
  }

  private getGithubBranchName(): string {
    let branchName = ''
    if (parseToBoolean(inputs.POLARIS_PRCOMMENT_ENABLED)) {
      // Only polaris use case
      branchName = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_HEAD_REF] || ''
    } else {
      // For pull requests, non-pull requests and manual trigger events
      if (process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_HEAD_REF] !== '') {
        branchName = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_HEAD_REF] || ''
      } else {
        branchName = process.env[constants.GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF_NAME] || ''
      }
    }
    return branchName
  }

  private setGithubData(githubToken: string, githubRepoName: string, githubRepoOwner: string, githubBranchName: string, githubPrNumber: string, githubHostUrl: string): GithubData {
    const isPrEvent = isPullRequestEvent()
    const githubData: GithubData = {
      user: {
        token: githubToken
      },
      repository: {
        name: githubRepoName,
        owner: {
          name: githubRepoOwner
        },
        branch: {
          name: githubBranchName
        }
      }
    }
    if (isPrEvent && githubPrNumber != null) {
      githubData.repository.pull = {
        number: Number(githubPrNumber)
      }
    }
    if (githubHostUrl !== '') {
      githubData.host = {
        url: githubHostUrl
      }
    }
    debug(`Github repository name: ${githubData.repository.name}`)
    debug(`Github repository owner name: ${githubData.repository.owner.name}`)
    debug(`Github branch name: ${githubData.repository.branch.name}`)
    debug(`Github host url: ${githubData.host?.url}`)
    debug(`Github pull request number: ${githubData.repository.pull?.number}`)
    return githubData
  }

  private setBlackDuckFixPrInputs(): BlackDuckFixPrData | undefined {
    if (inputs.BLACKDUCK_FIXPR_MAXCOUNT && isNaN(Number(inputs.BLACKDUCK_FIXPR_MAXCOUNT))) {
      throw new Error('Invalid value for '.concat(constants.BLACKDUCK_FIXPR_MAXCOUNT_KEY))
    }
    const createSinglePr = parseToBoolean(inputs.BLACKDUCK_FIXPR_CREATE_SINGLE_PR)
    if (createSinglePr && inputs.BLACKDUCK_FIXPR_MAXCOUNT) {
      throw new Error(constants.BLACKDUCK_FIXPR_MAXCOUNT_KEY.concat(' is not applicable with ').concat(constants.BLACKDUCK_FIXPR_CREATE_SINGLE_PR_KEY))
    }
    const blackDuckFixPrData: BlackDuckFixPrData = {}
    blackDuckFixPrData.enabled = true
    if (isBoolean(inputs.BLACKDUCK_FIXPR_CREATE_SINGLE_PR)) {
      blackDuckFixPrData.createSinglePR = parseToBoolean(inputs.BLACKDUCK_FIXPR_CREATE_SINGLE_PR)
    }
    if (inputs.BLACKDUCK_FIXPR_MAXCOUNT && !createSinglePr) {
      blackDuckFixPrData.maxCount = Number(inputs.BLACKDUCK_FIXPR_MAXCOUNT)
    }

    const useUpgradeGuidance: string[] = []
    if (inputs.BLACKDUCK_FIXPR_LONG_TERM_GUIDANCE != null && inputs.BLACKDUCK_FIXPR_LONG_TERM_GUIDANCE.length > 0) {
      const useUpgradeGuidanceList = inputs.BLACKDUCK_FIXPR_LONG_TERM_GUIDANCE.split(',')
      for (const upgradeGuidance of useUpgradeGuidanceList) {
        if (upgradeGuidance != null && upgradeGuidance !== '') {
          useUpgradeGuidance.push(upgradeGuidance.trim())
        }
      }
      blackDuckFixPrData.useUpgradeGuidance = useUpgradeGuidance
    }
    const fixPRFilterSeverities: string[] = []
    if (inputs.BLACKDUCK_FIXPR_FILTER_SEVERITIES != null && inputs.BLACKDUCK_FIXPR_FILTER_SEVERITIES.length > 0) {
      const filterSeverities = inputs.BLACKDUCK_FIXPR_FILTER_SEVERITIES.split(',')
      for (const fixPrSeverity of filterSeverities) {
        if (fixPrSeverity != null && fixPrSeverity !== '') {
          fixPRFilterSeverities.push(fixPrSeverity.trim())
        }
      }
    }
    if (fixPRFilterSeverities.length > 0) {
      blackDuckFixPrData.filter = {severities: fixPRFilterSeverities}
    }
    return blackDuckFixPrData
  }

  private setCoverityArbitraryArgs(): CoverityArbitrary {
    const covArbitraryData: CoverityArbitrary = {}
    if (inputs.COVERITY_BUILD_COMMAND) {
      covArbitraryData.build = {
        command: inputs.COVERITY_BUILD_COMMAND
      }
    }

    if (inputs.COVERITY_CLEAN_COMMAND) {
      covArbitraryData.clean = {
        command: inputs.COVERITY_CLEAN_COMMAND
      }
    }

    if (inputs.COVERITY_CONFIG_PATH) {
      covArbitraryData.config = {
        path: inputs.COVERITY_CONFIG_PATH
      }
    }

    if (inputs.COVERITY_ARGS) {
      covArbitraryData.args = inputs.COVERITY_ARGS
    }
    return covArbitraryData
  }

  private setBlackDuckArbitraryArgs(): BlackDuckArbitrary {
    const blackduckData: BlackDuckArbitrary = {}
    if (inputs.BLACKDUCK_SEARCH_DEPTH && Number.isInteger(parseInt(inputs.BLACKDUCK_SEARCH_DEPTH))) {
      blackduckData.search = {
        depth: parseInt(inputs.BLACKDUCK_SEARCH_DEPTH)
      }
    }

    if (inputs.BLACKDUCK_CONFIG_PATH) {
      blackduckData.config = {
        path: inputs.BLACKDUCK_CONFIG_PATH
      }
    }

    if (inputs.BLACKDUCK_ARGS) {
      blackduckData.args = inputs.BLACKDUCK_ARGS
    }
    return blackduckData
  }
}
