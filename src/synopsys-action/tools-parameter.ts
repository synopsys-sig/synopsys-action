import * as fs from 'fs'
import path from 'path'
import {debug, info} from '@actions/core'
import {validateBlackduckFailureSeverities, validateCoverityInstallDirectoryParam} from './validators'
import * as inputs from './inputs'
import {Polaris} from './input-data/polaris'
import {InputData} from './input-data/input-data'
import {Coverity} from './input-data/coverity'
import {Blackduck, BLACKDUCK_SCAN_FAILURE_SEVERITIES, FIXPR_ENVIRONMENT_VARIABLES, GithubData} from './input-data/blackduck'
import * as constants from '../application-constants'
import {parseToBoolean} from './utility'

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

  getFormattedCommandForPolaris(): string {
    let command = ''
    const assessmentTypeArray: string[] = []
    const assessmentTypesInput = inputs.POLARIS_ASSESSMENT_TYPES
    if (assessmentTypesInput != null && assessmentTypesInput.length > 0) {
      try {
        // converting provided assessmentTypes to uppercase
        const assessmentTypes = assessmentTypesInput.toUpperCase().split(',')
        for (const assessmentType of assessmentTypes) {
          const regEx = new RegExp('^[a-zA-Z]+$')
          if (assessmentType.trim().length > 0 && regEx.test(assessmentType.trim())) {
            assessmentTypeArray.push(assessmentType.trim())
          }
        }
      } catch (error) {
        throw new Error('Invalid value for '.concat(constants.POLARIS_ASSESSMENT_TYPES_KEY))
      }
    }

    const polData: InputData<Polaris> = {
      data: {
        polaris: {
          accesstoken: inputs.POLARIS_ACCESS_TOKEN,
          serverUrl: inputs.POLARIS_SERVER_URL,
          application: {name: inputs.POLARIS_APPLICATION_NAME},
          project: {name: inputs.POLARIS_PROJECT_NAME},
          assessment: {types: assessmentTypeArray}
        }
      }
    }

    const inputJson = JSON.stringify(polData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.POLARIS_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.POLARIS_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  getFormattedCommandForCoverity(): string {
    let command = ''
    const covData: InputData<Coverity> = {
      data: {
        coverity: {
          connect: {
            user: {name: inputs.COVERITY_USER, password: inputs.COVERITY_PASSPHRASE},
            url: inputs.COVERITY_URL,
            project: {name: inputs.COVERITY_PROJECT_NAME},
            stream: {name: inputs.COVERITY_STREAM_NAME}
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

    if (parseToBoolean(inputs.COVERITY_AUTOMATION_PRCOMMENT)) {
      info('Coverity Automation comment is enabled')
      covData.data.github = this.getGithubRepoInfo()
      covData.data.coverity.automation.prcomment = true
    } else {
      covData.data.coverity.automation.prcomment = false
    }

    const inputJson = JSON.stringify(covData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.COVERITY_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

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

    // Check and put environment variable for fix pull request
    if (parseToBoolean(inputs.BLACKDUCK_AUTOMATION_FIXPR)) {
      info('Blackduck Automation Fix PR is enabled')
      blackduckData.data.github = this.getGithubRepoInfo()
      blackduckData.data.blackduck.automation.fixpr = true
    } else {
      // Disable fix pull request for adapters
      blackduckData.data.blackduck.automation.fixpr = false
    }

    if (parseToBoolean(inputs.BLACKDUCK_AUTOMATION_PRCOMMENT)) {
      info('Blackduck Automation comment is enabled')
      blackduckData.data.github = this.getGithubRepoInfo()
      blackduckData.data.blackduck.automation.prcomment = true
    } else {
      blackduckData.data.blackduck.automation.prcomment = false
    }

    const inputJson = JSON.stringify(blackduckData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.BD_STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

    command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.BLACKDUCK_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.INPUT_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)
    return command
  }

  private getGithubRepoInfo(): GithubData | undefined {
    const githubToken = inputs.GITHUB_TOKEN
    const githubRepo = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY]
    const githubRepoName = githubRepo !== undefined ? githubRepo.substring(githubRepo.indexOf('/') + 1, githubRepo.length).trim() : ''
    const githubBranchName = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REF_NAME]
    const githubRef = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REF]
    const githubAPIURL = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_API_URL]

    // pr number will be part of "refs/pull/<pr_number>/merge"
    // if there is manual run without raising pr then GITHUB_REF will return refs/heads/branch_name
    const githubPrNumber = githubRef !== undefined ? githubRef.split('/')[2].trim() : ''
    const githubRepoOwner = process.env[FIXPR_ENVIRONMENT_VARIABLES.GITHUB_REPOSITORY_OWNER]

    if (githubToken == null) {
      throw new Error('Missing required github token for fix pull request/automation comment')
    }

    if ((parseToBoolean(inputs.BLACKDUCK_AUTOMATION_PRCOMMENT) || parseToBoolean(inputs.COVERITY_AUTOMATION_PRCOMMENT)) && isNaN(Number(githubPrNumber))) {
      throw new Error('Coverity/Blackduck automation PR comment can only be triggered on a pull request.')
    }

    // This condition is required as per ts-lint as these fields may have undefined as well
    if (githubRepoName != null && githubBranchName != null && githubRepoOwner != null && githubAPIURL != null) {
      return this.setGithubData(githubToken, githubRepoName, githubRepoOwner, githubBranchName, githubPrNumber, githubAPIURL)
    }
    return undefined
  }

  private setGithubData(githubToken: string, githubRepoName: string, githubRepoOwner: string, githubBranchName: string, githubPrNumber: string, apiurl: string): GithubData {
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
      api: {
        url: apiurl
      }
    }
    if (githubPrNumber != null) {
      githubData.repository.pull.number = Number(githubPrNumber)
    }
    return githubData
  }
}
