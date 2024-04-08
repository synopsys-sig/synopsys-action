import * as fs from 'fs'
import path from 'path'
import {debug, info} from '@actions/core'
import {isNullOrEmptyValue, validateBlackduckFailureSeverities, validateCoverityInstallDirectoryParam} from './validators'
import * as inputs from './inputs'
import {Polaris} from './input-data/polaris'
import {InputData} from './input-data/input-data'
import {Coverity} from './input-data/coverity'
import {Blackduck, BLACKDUCK_SCAN_FAILURE_SEVERITIES, GithubData, BlackDuckFixPrData} from './input-data/blackduck'
import * as constants from '../application-constants'
import {isBoolean, isPullRequestEvent, parseToBoolean} from './utility'
import {GITHUB_ENVIRONMENT_VARIABLES} from '../application-constants'

export class SynopsysToolsParameter {
  tempDir: string
  private static STAGE_OPTION = '--stage'
  static DIAGNOSTICS_OPTION = '--diagnostics'
  private static INPUT_OPTION = '--input'
  private static POLARIS_STAGE = 'polaris'
  private static POLARIS_STATE_FILE_NAME = 'polaris_input.json'
  private static COVERITY_STATE_FILE_NAME = 'coverity_input.json'
  private static BD_STATE_FILE_NAME = 'bd_input.json'
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
          assessment: {types: assessmentTypeArray},
          branch: {parent: {}}
        }
      }
    }

    if (inputs.POLARIS_TRIAGE) {
      polData.data.polaris.triage = inputs.POLARIS_TRIAGE
    }
    if (inputs.POLARIS_BRANCH_NAME) {
      polData.data.polaris.branch.name = inputs.POLARIS_BRANCH_NAME
    }
    if (inputs.POLARIS_TEST_SCA_TYPE) {
      polData.data.polaris.test = {
        sca: {
          type: inputs.POLARIS_TEST_SCA_TYPE
        }
      }
    }
    if (isPullRequestEvent()) {
      /** Set Polaris PR comment inputs in case of PR context */
      if (parseToBoolean(inputs.POLARIS_PRCOMMENT_ENABLED)) {
        info('Polaris PR comment is enabled')
        if (inputs.POLARIS_PARENT_BRANCH_NAME) {
          polData.data.polaris.branch.parent.name = inputs.POLARIS_PARENT_BRANCH_NAME
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
          severities: prCommentSeverities
        }
        polData.data.github = this.getGithubRepoInfo()
      }
    } else {
      /** Set Polaris SARIF inputs in case of non PR context */
      if (parseToBoolean(inputs.POLARIS_REPORTS_SARIF_CREATE)) {
        const sarifReportFilterSeverities: string[] = []
        const sarifReportFilterAssessmentIssuesType: string[] = []

        if (inputs.POLARIS_REPORTS_SARIF_SEVERITIES) {
          const filterSeverities = inputs.POLARIS_REPORTS_SARIF_SEVERITIES.split(',')
          for (const sarifSeverity of filterSeverities) {
            if (sarifSeverity != null && sarifSeverity !== '') {
              sarifReportFilterSeverities.push(sarifSeverity.trim())
            }
          }
        }

        if (inputs.POLARIS_REPORTS_SARIF_ISSUE_TYPES) {
          const filterIssueTypes = inputs.POLARIS_REPORTS_SARIF_ISSUE_TYPES.split(',')
          for (const issueType of filterIssueTypes) {
            if (issueType != null && issueType !== '') {
              sarifReportFilterAssessmentIssuesType.push(issueType.trim())
            }
          }
        }
        polData.data.polaris.reports = {
          sarif: {
            create: true,
            severities: sarifReportFilterSeverities,
            file: {
              path: inputs.POLARIS_REPORTS_SARIF_FILE_PATH.trim()
            },
            issue: {
              types: sarifReportFilterAssessmentIssuesType
            },
            groupSCAIssues: isBoolean(inputs.POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES) ? JSON.parse(inputs.POLARIS_REPORTS_SARIF_GROUP_SCA_ISSUES) : true
          }
        }
      }
    }

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
      const defaultStreamName = (isPrEvent ? process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_BASE_REF] : process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF_NAME]) || ''
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
          },
          automation: {}
        },
        network: {
          airGap: inputs.ENABLE_NETWORK_AIR_GAP
        },
        project: {}
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

    if (inputs.COVERITY_REPOSITORY_NAME) {
      covData.data.project.repository = {name: inputs.COVERITY_REPOSITORY_NAME}
    }

    if (inputs.COVERITY_BRANCH_NAME) {
      covData.data.project.branch = {name: inputs.COVERITY_BRANCH_NAME}
    }

    if (inputs.COVERITY_VERSION) {
      covData.data.coverity.version = inputs.COVERITY_VERSION
    }

    /** Set Coverity PR comment inputs in case of PR context */
    if (isPrEvent && parseToBoolean(inputs.COVERITY_PRCOMMENT_ENABLED)) {
      info('Coverity PR comment is enabled')
      covData.data.github = this.getGithubRepoInfo()
      covData.data.coverity.automation.prcomment = true
    }

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
          token: inputs.BLACKDUCK_API_TOKEN,
          automation: {}
        },
        network: {
          airGap: inputs.ENABLE_NETWORK_AIR_GAP
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

    if (isPullRequestEvent()) {
      /** Set Black Duck PR comment inputs in case of PR context */
      if (parseToBoolean(inputs.BLACKDUCK_PRCOMMENT_ENABLED)) {
        info('Black Duck PR comment is enabled')
        blackduckData.data.github = this.getGithubRepoInfo()
        blackduckData.data.blackduck.automation.prcomment = true
      }
    } else {
      /** Set Black Duck Fix PR inputs in case of non PR context */
      if (parseToBoolean(inputs.BLACKDUCK_FIXPR_ENABLED)) {
        info('Black Duck Fix PR is enabled')
        blackduckData.data.blackduck.fixpr = this.setBlackDuckFixPrInputs()
        blackduckData.data.github = this.getGithubRepoInfo()
      }
      /** Set Black Duck SARIF inputs in case of non PR context */
      if (parseToBoolean(inputs.BLACKDUCK_REPORTS_SARIF_CREATE)) {
        const sarifReportFilterSeverities: string[] = []
        if (inputs.BLACKDUCK_REPORTS_SARIF_SEVERITIES) {
          const filterSeverities = inputs.BLACKDUCK_REPORTS_SARIF_SEVERITIES.split(',')
          for (const sarifSeverity of filterSeverities) {
            if (sarifSeverity != null && sarifSeverity !== '') {
              sarifReportFilterSeverities.push(sarifSeverity.trim())
            }
          }
        }
        blackduckData.data.blackduck.reports = {
          sarif: {
            create: true,
            severities: sarifReportFilterSeverities,
            file: {
              path: inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH.trim()
            },
            groupSCAIssues: isBoolean(inputs.BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES) ? JSON.parse(inputs.BLACKDUCK_REPORTS_SARIF_GROUP_SCA_ISSUES) : true
          }
        }
      }
    }

    const inputJson = JSON.stringify(blackduckData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.BD_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.BLACKDUCK_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  private getGithubRepoInfo(): GithubData | undefined {
    const githubToken = inputs.GITHUB_TOKEN
    const githubRepo = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY]
    const githubRepoName = githubRepo !== undefined ? githubRepo.substring(githubRepo.indexOf('/') + 1, githubRepo.length).trim() : ''
    const githubBranchName = (parseToBoolean(inputs.POLARIS_PRCOMMENT_ENABLED) ? process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_HEAD_REF] : process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF_NAME]) || ''
    const githubRef = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REF]
    const githubServerUrl = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_SERVER_URL] || ''
    const githubHostUrl = githubServerUrl === constants.GITHUB_CLOUD_URL ? '' : githubServerUrl

    // pr number will be part of "refs/pull/<pr_number>/merge"
    // if there is manual run without raising pr then GITHUB_REF will return refs/heads/branch_name
    const githubPrNumber = githubRef !== undefined ? githubRef.split('/')[2].trim() : ''
    const githubRepoOwner = process.env[GITHUB_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY_OWNER] || ''

    if (isNullOrEmptyValue(githubToken)) {
      throw new Error('Missing required github token for fix pull request/pull request comments')
    }

    // This condition is required as per ts-lint as these fields may have undefined as well
    if (githubRepoName != null && githubBranchName != null && githubRepoOwner != null) {
      return this.setGithubData(githubToken, githubRepoName, githubRepoOwner, githubBranchName, githubPrNumber, githubHostUrl)
    }
    return undefined
  }

  private setGithubData(githubToken: string, githubRepoName: string, githubRepoOwner: string, githubBranchName: string, githubPrNumber: string, githubHostUrl: string): GithubData {
    const githubData: GithubData = {
      user: {
        token: githubToken
      },
      repository: {
        name: githubRepoName,
        owner: {
          name: githubRepoOwner
        },
        pull: {},
        branch: {
          name: githubBranchName
        }
      },
      host: {
        url: githubHostUrl
      }
    }
    if (githubPrNumber != null) {
      githubData.repository.pull.number = Number(githubPrNumber)
    }
    debug(`Github repository name: ${githubData.repository.name}`)
    debug(`Github repository owner name: ${githubData.repository.owner.name}`)
    debug(`Github branch name: ${githubData.repository.branch.name}`)
    debug(`Github host url: ${githubData.host?.url}`)
    debug(`Github pull request number: ${githubData.repository.pull.number}`)
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
    blackDuckFixPrData.createSinglePR = createSinglePr === true
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
    blackDuckFixPrData.filter = {
      ...(fixPRFilterSeverities.length > 0 ? {severities: fixPRFilterSeverities} : {})
    }
    return blackDuckFixPrData
  }
}
