import {debug, info, setFailed, warning} from '@actions/core'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {getBridgeDefaultPath, SynopsysBridge, validateBridgeURL} from './synopsys-action/synopsys-bridge'
import {BRIDGE_DOWNLOAD_URL, POLARIS_ACCESS_TOKEN, POLARIS_APPLICATION_NAME, POLARIS_ASSESSMENT_TYPES, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL, SYNOPSYS_BRIDGE_PATH, COVERITY_URL, COVERITY_USER, COVERITY_PASSPHRASE, COVERITY_PROJECT_NAME, BLACKDUCK_URL, BLACKDUCK_API_TOKEN, BLACKDUCK_INSTALL_DIRECTORY, BLACKDUCK_SCAN_FULL} from './synopsys-action/inputs'

import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {DownloadFileResponse, extractZipped, getRemoteFile} from './synopsys-action/download-utility'
import {rmRF} from '@actions/io'

async function run() {
  info('Synopsys Action started...')

  const tempDir = await createTempDir()
  let formattedCommand = ''

  // Automatically configure bridge if Bridge download url is provided
  if (BRIDGE_DOWNLOAD_URL) {
    if (!validateBridgeURL(BRIDGE_DOWNLOAD_URL)) {
      setFailed('Provided Bridge url is either not valid for the platform')
      return Promise.reject('Provided Bridge url is either not valid for the platform')
    }

    // Download file in temporary directory
    info('Downloading and configuring Synopsys Bridge')
    const downloadResponse: DownloadFileResponse = await getRemoteFile(tempDir, BRIDGE_DOWNLOAD_URL)
    const extractZippedFilePath: string = SYNOPSYS_BRIDGE_PATH || getBridgeDefaultPath()

    // Clear the existing bridge, if available
    await rmRF(extractZippedFilePath)

    await extractZipped(downloadResponse.filePath, extractZippedFilePath)
    info('Download and configuration of Synopsys Bridge completed')
  }

  if (POLARIS_SERVER_URL) {
    const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
    const polarisAssessmentTypes: Array<string> = JSON.parse(POLARIS_ASSESSMENT_TYPES)
    formattedCommand = polarisCommandFormatter.getFormattedCommandForPolaris(POLARIS_ACCESS_TOKEN, POLARIS_APPLICATION_NAME, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL, polarisAssessmentTypes)

    debug('Formatted command is - '.concat(formattedCommand))
  } else if (COVERITY_URL) {
    const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
    formattedCommand = coverityCommandFormatter.getFormattedCommandForCoverity(COVERITY_USER, COVERITY_PASSPHRASE, COVERITY_URL, COVERITY_PROJECT_NAME)
  } else if (BLACKDUCK_URL) {
    const blackDuckCommandFormatter = new SynopsysToolsParameter(tempDir)
    formattedCommand = blackDuckCommandFormatter.getFormattedCommandForBlackduck(BLACKDUCK_URL, BLACKDUCK_API_TOKEN, BLACKDUCK_INSTALL_DIRECTORY, BLACKDUCK_SCAN_FULL)
  } else {
    setFailed('Not supported flow')
    warning('Not supported flow')
    return Promise.reject(new Error('Not Supported Flow'))
  }

  try {
    const sb = new SynopsysBridge()
    await sb.executeBridgeCommand(formattedCommand, getWorkSpaceDirectory()).catch(reason => {
      throw reason
    })
  } catch (error: any) {
    setFailed(error)
    return
  } finally {
    await cleanupTempDir(tempDir)
  }
}

run()
