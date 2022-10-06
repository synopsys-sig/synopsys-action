import {debug, info, setFailed, warning} from '@actions/core'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {getBridgeDefaultPath, SynopsysBridge, validateBridgeURL} from './synopsys-action/synopsys-bridge'
import * as inputs from './synopsys-action/inputs'

import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {DownloadFileResponse, extractZipped, getRemoteFile} from './synopsys-action/download-utility'
import {rmRF} from '@actions/io'
import * as fs from 'fs'

export async function run() {
  info('Synopsys Action started...')

  const tempDir = await createTempDir()
  let formattedCommand = ''

  try {
    // Automatically configure bridge if Bridge download url is provided
    if (inputs.BRIDGE_DOWNLOAD_URL) {
      if (!validateBridgeURL(inputs.BRIDGE_DOWNLOAD_URL)) {
        return Promise.reject('Provided Bridge url is either not valid for the platform')
      }

      // Download file in temporary directory
      info('Downloading and configuring Synopsys Bridge')
      const downloadResponse: DownloadFileResponse = await getRemoteFile(tempDir, inputs.BRIDGE_DOWNLOAD_URL)
      const extractZippedFilePath: string = inputs.SYNOPSYS_BRIDGE_PATH || getBridgeDefaultPath()

      // Clear the existing bridge, if available
      if (fs.existsSync(extractZippedFilePath)) {
        const files: string[] = fs.readdirSync(extractZippedFilePath)
        for (const file of files) {
          await rmRF(file)
        }
      }

      await extractZipped(downloadResponse.filePath, extractZippedFilePath)
      info('Download and configuration of Synopsys Bridge completed')
    }

    /*if (inputs.POLARIS_SERVER_URL && inputs.COVERITY_URL && inputs.BLACKDUCK_URL && inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES != null && inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES.length > 0) {
      const commandFormatter = new SynopsysToolsParameter(tempDir)
      const polarisAssessmentTypes: Array<string> = JSON.parse(inputs.POLARIS_ASSESSMENT_TYPES)
      const polarisCommand = commandFormatter.getFormattedCommandForPolaris(inputs.POLARIS_ACCESS_TOKEN, inputs.POLARIS_APPLICATION_NAME, inputs.POLARIS_PROJECT_NAME, inputs.POLARIS_SERVER_URL, polarisAssessmentTypes)
      const coverityCommand = commandFormatter.getFormattedCommandForCoverity(inputs.COVERITY_USER, inputs.COVERITY_PASSPHRASE, inputs.COVERITY_URL, inputs.COVERITY_PROJECT_NAME, inputs.COVERITY_STREAM_NAME, inputs.COVERITY_INSTALL_DIRECTORY, inputs.COVERITY_POLICY_VIEW, inputs.COVERITY_REPOSITORY_NAME, inputs.COVERITY_BRANCH_NAME)
      let failureSeverities: Array<string> = []
      failureSeverities = JSON.parse(inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES)
      const blackDuckCommand = commandFormatter.getFormattedCommandForBlackduck(inputs.BLACKDUCK_URL, inputs.BLACKDUCK_API_TOKEN, inputs.BLACKDUCK_INSTALL_DIRECTORY, inputs.BLACKDUCK_SCAN_FULL, failureSeverities)
      formattedCommand = polarisCommand.concat(coverityCommand).concat(blackDuckCommand)
    } else */
    if (inputs.POLARIS_SERVER_URL) {
      const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
      const polarisAssessmentTypes: Array<string> = JSON.parse(inputs.POLARIS_ASSESSMENT_TYPES)
      formattedCommand = formattedCommand.concat(polarisCommandFormatter.getFormattedCommandForPolaris(inputs.POLARIS_ACCESS_TOKEN, inputs.POLARIS_APPLICATION_NAME, inputs.POLARIS_PROJECT_NAME, inputs.POLARIS_SERVER_URL, polarisAssessmentTypes))

      debug('Formatted command is - '.concat(formattedCommand))
    }

    if (inputs.COVERITY_URL) {
      const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
      formattedCommand = formattedCommand.concat(coverityCommandFormatter.getFormattedCommandForCoverity(inputs.COVERITY_USER, inputs.COVERITY_PASSPHRASE, inputs.COVERITY_URL, inputs.COVERITY_PROJECT_NAME, inputs.COVERITY_STREAM_NAME, inputs.COVERITY_INSTALL_DIRECTORY, inputs.COVERITY_POLICY_VIEW, inputs.COVERITY_REPOSITORY_NAME, inputs.COVERITY_BRANCH_NAME))
    }

    if (inputs.BLACKDUCK_URL) {
      const blackDuckCommandFormatter = new SynopsysToolsParameter(tempDir)
      let failureSeverities: Array<string> = []
      if (inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES != null && inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES.length > 0) {
        try {
          failureSeverities = JSON.parse(inputs.BLACKDUCK_SCAN_FAILURE_SEVERITIES)
        } catch (error) {
          return Promise.reject('Provided value is not valid - BLACKDUCK_SCAN_FAILURE_SEVERITIES')
        }
      }

      formattedCommand = formattedCommand.concat(blackDuckCommandFormatter.getFormattedCommandForBlackduck(inputs.BLACKDUCK_URL, inputs.BLACKDUCK_API_TOKEN, inputs.BLACKDUCK_INSTALL_DIRECTORY, inputs.BLACKDUCK_SCAN_FULL, failureSeverities))
    }

    /* else {
      warning('Not supported flow')
      return Promise.reject(new Error('Not Supported Flow'))
    }*/
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

run().catch(error => {
  setFailed('Workflow failed! '.concat(error.message))
})
