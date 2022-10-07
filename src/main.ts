import {debug, info, setFailed, warning} from '@actions/core'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {getBridgeDefaultPath, SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {validateBlackDuckInputs, validateCoverityInputs, validatePolarisInputs} from './synopsys-action/validators'
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

    if (validatePolarisInputs()) {
      const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
      formattedCommand = formattedCommand.concat(polarisCommandFormatter.getFormattedCommandForPolaris())
      debug('Formatted command is - '.concat(formattedCommand))
    }

    if (validateCoverityInputs()) {
      const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
      formattedCommand = formattedCommand.concat(coverityCommandFormatter.getFormattedCommandForCoverity())
    }

    if (validateBlackDuckInputs()) {
      const blackDuckCommandFormatter = new SynopsysToolsParameter(tempDir)
      formattedCommand = formattedCommand.concat(blackDuckCommandFormatter.getFormattedCommandForBlackduck())
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
