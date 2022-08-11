import * as fs from 'fs'
import path from 'path'
import {info} from '@actions/core'

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

export class SynopsysToolsParameter {
  tempDir: string
  private static STAGE_OPTION = '--stage'
  private static STATE_OPTION = '--state'
  private static POLARIS_STAGE = 'polaris'
  private static STATE_FILE_NAME = 'input.json'
  private static SPACE = ' '

  constructor(tempDir: string) {
    this.tempDir = tempDir
  }

  getFormattedCommandForPolaris(accessTok: string, applicationName: string, projectName: string, serverURL: string, assessmentTypes: string[]): string {
    if (accessTok == null || accessTok.length === 0 || applicationName == null || applicationName.length === 0 || projectName == null || projectName.length === 0 || serverURL == null || serverURL.length === 0 || assessmentTypes.length === 0) {
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
          accesstoken: accessTok,
          serverUrl: serverURL,
          application: {name: applicationName},
          project: {name: projectName},
          assessment: {types: assessmentTypeEnums}
        }
      }
    }

    const inputJson = JSON.stringify(polData)

    info('Formatted json file is - '.concat(inputJson))

    info(inputJson)

    const stateFilePath = path.join(this.tempDir, SynopsysToolsParameter.STATE_FILE_NAME)
    fs.writeFileSync(stateFilePath, inputJson)

    const command = SynopsysToolsParameter.STAGE_OPTION.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.POLARIS_STAGE).concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.STATE_OPTION).concat(SynopsysToolsParameter.SPACE).concat(stateFilePath) //'--stage polaris --state '.concat(stateFilePath)

    return command
  }
}
