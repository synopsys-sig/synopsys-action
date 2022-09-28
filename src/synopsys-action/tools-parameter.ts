import * as fs from 'fs'
import path from 'path'
import {debug} from '@actions/core'
import {validatePolarisParams, validateCoverityParams, validateBalckduckParams, validateCoverityInstallDirectoryParam, validateBlackduckFailureSeverities} from './validators'

export enum PolarisAssessmentType {
  SCA = 'SCA',
  SAST = 'SAST'
}

export interface InputData<Type> {
  data: Type
}

export interface Polaris {
  polaris: PolarisData
}

export interface PolarisData {
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  assessment: {types: PolarisAssessmentType[]}
}

export interface Coverity {
  coverity: CoverityConnect
  project: ProjectData
}

export interface ProjectData {
  repository?: {name: string}
  branch?: {name: string}
}

export interface CoverityConnect {
  connect: CoverityData
  install?: {directory: string}
}

export interface CoverityData {
  user: {name: string; password: string}
  url: string
  project: {name: string}
  stream: {name: string}
  policy?: {view: string}
}

export enum BLACKDUCK_SCAN_FAILURE_SEVERITIES {
  ALL = 'ALL',
  NONE = 'NONE',
  BLOCKER = 'BLOCKER',
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  OK = 'OK',
  TRIVIAL = 'TRIVIAL',
  UNSPECIFIED = 'UNSPECIFIED'
}

export interface Blackduck {
  blackduck: BlackduckData
}

export interface BlackduckData {
  url: string
  token: string
  install?: {directory: string}
  scan?: {full?: boolean; failure?: {severities: BLACKDUCK_SCAN_FAILURE_SEVERITIES[]}}
}

export class SynopsysToolsParameter {
  tempDir: string
  private static STAGE_OPTION = '--stage'
  private static STATE_OPTION = '--state'
  private static POLARIS_STAGE = 'polaris'
  private static STATE_FILE_NAME = 'input.json'
  // Coverity parameters
  private static COVERITY_STAGE = 'connect'
  private static SPACE = ' '
  // Balckduck parameters
  private static BLACKDUCK_STAGE = 'blackduck'

  constructor(tempDir: string) {
    this.tempDir = tempDir
  }

  getFormattedCommandForPolaris(accessToken: string, applicationName: string, projectName: string, serverURL: string, assessmentTypes: string[]): string {
    validatePolarisParams(accessToken, applicationName, projectName, serverURL, assessmentTypes)

    const assessmentTypeEnums: PolarisAssessmentType[] = []

    for (const assessmentType of assessmentTypes) {
      if (!Object.values(PolarisAssessmentType).includes(assessmentType as PolarisAssessmentType)) {
        throw new Error('Provided Assessment type not found')
      } else {
        assessmentTypeEnums.push(PolarisAssessmentType[assessmentType as keyof typeof PolarisAssessmentType])
      }
    }

    const polData: InputData<Polaris> = {
      data: {
        polaris: {
          accesstoken: accessToken,
          serverUrl: serverURL,
          application: {name: applicationName},
          project: {name: projectName},
          assessment: {types: assessmentTypeEnums}
        }
      }
    }

    const inputJson = JSON.stringify(polData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

    const command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.POLARIS_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.STATE_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath)

    return command
  }

  getFormattedCommandForCoverity(userName: string, passWord: string, coverityUrl: string, projectName: string, streamName: string, installDir: string, policyView: string, repositoryName: string, branchName: string): string {
    validateCoverityParams(userName, passWord, coverityUrl, projectName, streamName)
    const covData: InputData<Coverity> = {
      data: {
        coverity: {
          connect: {
            user: {name: userName, password: passWord},
            url: coverityUrl,
            project: {name: projectName},
            stream: {name: streamName}
          }
        },
        project: {}
      }
    }

    if (installDir) {
      const osName = process.platform
      if (osName === 'win32') {
        validateCoverityInstallDirectoryParam(installDir)
      }
      covData.data.coverity.install = {directory: installDir}
    }

    if (policyView) {
      covData.data.coverity.connect.policy = {view: policyView}
    }

    if (repositoryName) {
      covData.data.project.repository = {name: repositoryName}
    }

    if (repositoryName) {
      covData.data.project.branch = {name: branchName}
    }

    const inputJson = JSON.stringify(covData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

    const command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.COVERITY_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.STATE_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE).concat('--verbose') //'--stage polaris --state '.concat(stateFilePath)

    return command
  }

  getFormattedCommandForBlackduck(blackduckUrl: string, apiToken: string, installDirectory: string, scanFull: string, failureSeverities: string[]): string {
    validateBalckduckParams(blackduckUrl, apiToken, installDirectory)
    const blackduckData: InputData<Blackduck> = {
      data: {
        blackduck: {
          url: blackduckUrl,
          token: apiToken
        }
      }
    }

    if (installDirectory) {
      blackduckData.data.blackduck.install = {directory: installDirectory}
    }

    if (scanFull) {
      let scanFullValue = false
      if (scanFull.toLowerCase() === 'true' || scanFull.toLowerCase() === 'false') {
        scanFullValue = scanFull.toLowerCase() === 'true'
      } else {
        throw new Error('boolean value is required for blackduck_scan_full')
      }
      blackduckData.data.blackduck.scan = {full: scanFullValue}
    }

    if (failureSeverities && failureSeverities.length > 0) {
      validateBlackduckFailureSeverities(failureSeverities)
      const failureSeverityEnums: BLACKDUCK_SCAN_FAILURE_SEVERITIES[] = []
      for (const failureSeverity of failureSeverities) {
        if (!Object.values(BLACKDUCK_SCAN_FAILURE_SEVERITIES).includes(failureSeverity as BLACKDUCK_SCAN_FAILURE_SEVERITIES)) {
          throw new Error('Provided Severity for blackduck is not valid')
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

    const inputJson = JSON.stringify(blackduckData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

    const command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.BLACKDUCK_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.STATE_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE)

    return command
  }
}
