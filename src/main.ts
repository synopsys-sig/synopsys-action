import {debug, info, setFailed, warning} from '@actions/core'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {getBridgeDefaultPath, SynopsysBridge, validateBridgeURL} from './synopsys-action/synopsys-bridge'
import * as inputs from './synopsys-action/inputs'

import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {DownloadFileResponse, extractZipped, getRemoteFile} from './synopsys-action/download-utility'
import {cp, rmRF} from '@actions/io'
import path from 'path'
import * as fs from 'fs'

export async function run() {
  info('Synopsys Action started...')

  const tempDir = await createTempDir()
  let formattedCommand = ''

  try {
    const osName = process.platform
    let extractZippedFilePath: string = inputs.SYNOPSYS_BRIDGE_PATH || getBridgeDefaultPath()

    // Automatically configure bridge if Bridge download url is provided
    if (inputs.CONFIGURE_FROM_REPO && inputs.CONFIGURE_FROM_REPO.toLowerCase() === 'true') {
      info('Configuring Bridge from synopsys-action repository')
      let configFilePath = path.join(getWorkSpaceDirectory(), 'bridge')
      let availableFileName = ''
      if (osName === 'darwin') {
        availableFileName = getRequiredFileNameWithPattern(configFilePath, 'mac')
      } else if (osName === 'win32') {
        availableFileName = getRequiredFileNameWithPattern(configFilePath, 'win')
      } else {
        availableFileName = getRequiredFileNameWithPattern(configFilePath, 'linux')
      }

      await cp(configFilePath, tempDir, {force: true, copySourceDirectory: false, recursive: true})
      const configFilePathTemp = path.join(tempDir, availableFileName)
      await extractZipped(configFilePathTemp, extractZippedFilePath)
    } else if (inputs.BRIDGE_DOWNLOAD_URL) {
      if (!validateBridgeURL(inputs.BRIDGE_DOWNLOAD_URL)) {
        return Promise.reject('Provided Bridge url is either not valid for the platform')
      }

      // Download file in temporary directory
      info('Downloading and configuring Synopsys Bridge')
      const downloadResponse: DownloadFileResponse = await getRemoteFile(tempDir, inputs.BRIDGE_DOWNLOAD_URL)
      const extractZippedFilePath: string = inputs.SYNOPSYS_BRIDGE_PATH || getBridgeDefaultPath()

      // Clear the existing bridge, if available
      await rmRF(extractZippedFilePath)

      await extractZipped(downloadResponse.filePath, extractZippedFilePath)
      info('Download and configuration of Synopsys Bridge completed')
    }

    if (inputs.POLARIS_SERVER_URL) {
      const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
      const polarisAssessmentTypes: Array<string> = JSON.parse(inputs.POLARIS_ASSESSMENT_TYPES)
      formattedCommand = polarisCommandFormatter.getFormattedCommandForPolaris(inputs.POLARIS_ACCESS_TOKEN, inputs.POLARIS_APPLICATION_NAME, inputs.POLARIS_PROJECT_NAME, inputs.POLARIS_SERVER_URL, polarisAssessmentTypes)

      debug('Formatted command is - '.concat(formattedCommand))
    } else if (inputs.COVERITY_URL) {
      const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
      formattedCommand = coverityCommandFormatter.getFormattedCommandForCoverity(inputs.COVERITY_USER, inputs.COVERITY_PASSPHRASE, inputs.COVERITY_URL, inputs.COVERITY_PROJECT_NAME, inputs.COVERITY_STREAM_NAME, inputs.COVERITY_INSTALL_DIRECTORY, inputs.COVERITY_POLICY_VIEW, inputs.COVERITY_REPOSITORY_NAME, inputs.COVERITY_BRANCH_NAME)
    } else if (inputs.BLACKDUCK_URL) {
      const blackDuckCommandFormatter = new SynopsysToolsParameter(tempDir)
      let failureSeverities: Array<string> = []
      if (inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES != null && inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES.length > 0) {
        try {
          failureSeverities = JSON.parse(inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES)
        } catch (error) {
          return Promise.reject('Provided value is not valid - BLACKDUCK_SCAN_FAILURE_SEVERITIES')
        }
      }

      formattedCommand = blackDuckCommandFormatter.getFormattedCommandForBlackduck(inputs.BLACKDUCK_URL, inputs.BLACKDUCK_API_TOKEN, inputs.BLACKDUCK_INSTALL_DIRECTORY, inputs.BLACKDUCK_SCAN_FULL, failureSeverities)
    } else {
      warning('Not supported flow')
      return Promise.reject(new Error('Not Supported Flow'))
    }
  } catch (error: any) {
    debug(error.stackTrace)
    return Promise.reject(error)
  }

  try {
    const sb = new SynopsysBridge()
    await sb.executeBridgeCommand(formattedCommand, getWorkSpaceDirectory()).catch(reason => {
      throw reason
    })
  } catch (error: any) {
    return Promise.reject(error)
  } finally {
    await cleanupTempDir(tempDir)
  }
}

function getRequiredFileNameWithPattern(directoryPath: string, fileSubString: string): string {
  const files: string[] = fs.readdirSync(directoryPath)
  const fileName = files.find(file => {
    return file.includes(fileSubString)
  })

  return String(fileName)
}

run().catch(error => {
  setFailed('Workflow failed! '.concat(error.message))
})
