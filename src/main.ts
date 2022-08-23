import {debug, info, warning} from '@actions/core'
import {AltairAPIService} from './synopsys-action/altair-api'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {POLARIS_ACCESS_TOKEN, POLARIS_APPLICATION_NAME, POLARIS_ASSESSMENT_TYPES, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL, COVERITY_URL, COVERITY_USER, COVERITY_PASSPHRASE} from './synopsys-action/inputs'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import {exec} from '@actions/exec'

async function run() {
  info('Synopsys Action started...')

  const tempDir = createTempDir()
  let formattedCommand = ''

  if (POLARIS_SERVER_URL) {
    const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
    const polarisAssessmentTypes: Array<string> = POLARIS_ASSESSMENT_TYPES.split(',')
      .filter(at => at != '')
      .map(at => at.trim())
    formattedCommand = polarisCommandFormatter.getFormattedCommandForPolaris(POLARIS_ACCESS_TOKEN, POLARIS_APPLICATION_NAME, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL, polarisAssessmentTypes)

    debug('Formatted command is - '.concat(formattedCommand))
  } else if (COVERITY_URL) {
    const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
    formattedCommand = coverityCommandFormatter.getFormattedCommandForCoverity(COVERITY_USER, COVERITY_PASSPHRASE, COVERITY_URL)
  } else {
    warning('Not supported flow')
    return Promise.reject(new Error('Not Supported Flow'))
  }

  try {
    const sb = new SynopsysBridge()
    await sb.executeBridgeCommand(formattedCommand, getWorkSpaceDirectory())
  } catch (error: any) {
    return Promise.reject('Error while executing bridge command - '.concat(error))
  } finally {
    cleanupTempDir(tempDir)
  }
}

run()
