import {debug, info, setFailed, warning, error} from '@actions/core'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {getBridgeDefaultPath, SynopsysBridge, validateBridgeURL} from './synopsys-action/synopsys-bridge'
import {validateParameters} from './synopsys-action/validators'
import * as inputs from './synopsys-action/inputs'
import * as constants from './application-constants'

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
  } catch (error: any) {
    await cleanupTempDir(tempDir)
    info(error)
    if (error.message.toLowerCase().includes('404') || error.message.toLowerCase().includes('Invalid URL')) {
      let os: string = ''
      if (process.env['RUNNER_OS']) {
        os = process.env['RUNNER_OS']
      }
      return Promise.reject('Provided Bridge url is not valid for the configured '.concat(os, ' runner'))
    } else if (error.message.toLowerCase().includes('empty')) {
      return Promise.reject('Provided Bridge URL cannot be empty')
    } else {
      return Promise.reject(error)
    }
  }

  try {
    if (inputs.POLARIS_SERVER_URL == null && inputs.COVERITY_URL == null && inputs.BLACKDUCK_URL == null) {
      warning('Not supported flow')
      return Promise.reject(new Error('Not Supported Flow'))
    }

    if (inputs.POLARIS_SERVER_URL) {
      const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)

      const paramsMap = new Map()
      paramsMap.set(constants.POLARIS_ACCESS_TOKEN_KEY, inputs.POLARIS_ACCESS_TOKEN)
      paramsMap.set(constants.POLARIS_APPLICATION_NAME_KEY, inputs.POLARIS_APPLICATION_NAME)
      paramsMap.set(constants.POLARIS_PROJECT_NAME_KEY, inputs.POLARIS_PROJECT_NAME)
      paramsMap.set(constants.POLARIS_SERVER_URL_KEY, inputs.POLARIS_SERVER_URL)
      paramsMap.set(constants.POLARIS_ASSESSMENT_TYPES_KEY, inputs.POLARIS_ASSESSMENT_TYPES)
      if (validateParameters(paramsMap, 'Polaris')) {
        const polarisAssessmentTypes: Array<string> = JSON.parse(inputs.POLARIS_ASSESSMENT_TYPES)
        formattedCommand = formattedCommand.concat(polarisCommandFormatter.getFormattedCommandForPolaris(inputs.POLARIS_ACCESS_TOKEN, inputs.POLARIS_APPLICATION_NAME, inputs.POLARIS_PROJECT_NAME, inputs.POLARIS_SERVER_URL, polarisAssessmentTypes))
        debug('Formatted command is - '.concat(formattedCommand))
      }
    }

    if (inputs.COVERITY_URL) {
      const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
      const paramsMap = new Map()
      paramsMap.set(constants.COVERITY_USER_KEY, inputs.COVERITY_USER)
      paramsMap.set(constants.COVERITY_PASSPHRASE_KEY, inputs.COVERITY_PASSPHRASE)
      paramsMap.set(constants.COVERITY_URL_KEY, inputs.COVERITY_URL)
      paramsMap.set(constants.COVERITY_PROJECT_NAME_KEY, inputs.COVERITY_PROJECT_NAME)
      paramsMap.set(constants.COVERITY_STREAM_NAME_KEY, inputs.COVERITY_STREAM_NAME)
      if (validateParameters(paramsMap, 'Coverity')) {
        formattedCommand = formattedCommand.concat(coverityCommandFormatter.getFormattedCommandForCoverity(inputs.COVERITY_USER, inputs.COVERITY_PASSPHRASE, inputs.COVERITY_URL, inputs.COVERITY_PROJECT_NAME, inputs.COVERITY_STREAM_NAME, inputs.COVERITY_INSTALL_DIRECTORY, inputs.COVERITY_POLICY_VIEW, inputs.COVERITY_REPOSITORY_NAME, inputs.COVERITY_BRANCH_NAME))
      }
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

      const paramsMap = new Map()
      paramsMap.set(constants.BLACKDUCK_URL_KEY, inputs.BLACKDUCK_URL)
      paramsMap.set(constants.BLACKDUCK_API_TOKEN_KEY, inputs.BLACKDUCK_API_TOKEN)
      paramsMap.set(constants.BLACKDUCK_INSTALL_DIRECTORY_KEY, inputs.BLACKDUCK_INSTALL_DIRECTORY)
      paramsMap.set(constants.BLACKDUCK_SCAN_FULL_KEY, inputs.BLACKDUCK_SCAN_FULL)
      paramsMap.set(constants.BLACKDUCK_SCAN_FAILURE_SEVERITIES_KEY, failureSeverities)
      if (validateParameters(paramsMap, 'Blackduck')) {
        formattedCommand = formattedCommand.concat(blackDuckCommandFormatter.getFormattedCommandForBlackduck(inputs.BLACKDUCK_URL, inputs.BLACKDUCK_API_TOKEN, inputs.BLACKDUCK_INSTALL_DIRECTORY, inputs.BLACKDUCK_SCAN_FULL, failureSeverities))
      }
    }

    if (formattedCommand.length === 0) {
      return Promise.reject(new Error('Mandatory fields are missing for given scans'))
    }
  } catch (error: any) {
    await cleanupTempDir(tempDir)
    debug(error.stackTrace)
    return Promise.reject(error.message)
  }

  try {
    const sb = new SynopsysBridge()
    await sb.executeBridgeCommand(formattedCommand, getWorkSpaceDirectory())
  } catch (error: any) {
    throw error
  } finally {
    await cleanupTempDir(tempDir)
  }
}

run().catch(error => {
  if (error.message != undefined) {
    setFailed('Workflow failed! '.concat(error.message))
  } else {
    setFailed('Workflow failed! '.concat(error))
  }
})
