import * as fs from 'fs'
import path from 'path'
import {debug} from '@actions/core'
import {validatePolarisParams, validateCoverityParams} from './validators'

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
}

export interface CoverityConnect {
  connect: CoverityData
}

export interface CoverityData {
  user: {name: string; password: string}
  url: string
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

  getFormattedCommandForCoverity(userName: string, passWord: string, coverityUrl: string): string {
    validateCoverityParams(userName, passWord, coverityUrl)
    const covData: InputData<Coverity> = {
      data: {
        coverity: {
          connect: {
            user: {name: userName, password: passWord},
            url: coverityUrl
          }
        }
      }
    }

    const inputJson = JSON.stringify(covData)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    debug('Generated state json file at - '.concat(stateFilePath))
    debug('Generated state json file content is - '.concat(inputJson))

    const command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.COVERITY_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.STATE_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE).concat('--verbose') //'--stage polaris --state '.concat(stateFilePath)

    return command
  }
}
