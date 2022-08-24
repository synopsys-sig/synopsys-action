import * as fs from 'fs'
import path from 'path'
import {debug} from '@actions/core'

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
  project: {name: string}
  policy: {view: string}
}

export class SynopsysToolsParameter {
  tempDir: string
  private static STAGE_OPTION = '--stage'
  private static STATE_OPTION = '--state'
  private static POLARIS_STAGE = 'polaris'
  private static STATE_FILE_NAME = 'input.json'
  // Coverity parameters
  private static COVERITY_STAGE = 'connect'
  private static COVERITY_STATE_FILE_NAME = 'input.json'
  private static SPACE = ' '

  constructor(tempDir: string) {
    this.tempDir = tempDir
  }

  getFormattedCommandForPolaris(accessToken: string, applicationName: string, projectName: string, serverURL: string, assessmentTypes: string[]): string {
    if (accessToken == null || accessToken.length === 0 || applicationName == null || applicationName.length === 0 || projectName == null || projectName.length === 0 || serverURL == null || serverURL.length === 0 || assessmentTypes.length === 0) {
      throw new Error('One or more required parameters for Altair is missing')
    }

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

    const command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.POLARIS_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.STATE_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath).concat(SynopsysToolsParameter.SPACE).concat('--verbose') //'--stage polaris --state '.concat(stateFilePath)

    return command
  }

  getFormattedCommandForCoverity(userName: string, passWord: string, coverityUrl: string, projectName: string): string {
    /*if (userName == null || userName.length === 0 || passWord == null || passWord.length === 0 || coverityUrl == null || coverityUrl.length === 0 || projectName == null || projectName.length === 0) {
      throw new Error('One or more required parameters for Coverity is missing')
    }*/

    const covData: InputData<Coverity> = {
      data: {
        coverity: {
          connect: {
            user: {name: userName, password: passWord},
            url: coverityUrl,
            project: {name: projectName},
            policy: {view: 'SAST'}
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
