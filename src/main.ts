import {debug, info, warning} from '@actions/core'
import {AltairAPIService} from './synopsys-action/altair-api'
import {SynopsysToolsParameter} from './synopsys-action/tools-parameter-schema'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {POLARIS_ACCESS_TOKEN, POLARIS_APPLICATION_NAME, POLARIS_ASSESSMENT_TYPES, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL} from './synopsys-action/inputs'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'

async function run() {
  info('Synopsys Action started...')
  info('Github action workspace is - '.concat(getWorkSpaceDirectory()))

  const tempDir = createTempDir()
  let formattedCommand = ''

  if (POLARIS_SERVER_URL) {
    info('Polaris Server url is - '.concat(POLARIS_SERVER_URL))
    console.log('Polaris Server url is - '.concat(POLARIS_SERVER_URL))
    console.log('Polaris Server secret is - '.concat(POLARIS_ACCESS_TOKEN))

    const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
    const polarisAssessmentTypes: Array<string> = POLARIS_ASSESSMENT_TYPES.split(',')
      .filter(at => at != '')
      .map(at => at.trim())
    formattedCommand = polarisCommandFormatter.getFormattedCommandForPolaris(POLARIS_ACCESS_TOKEN, POLARIS_APPLICATION_NAME, POLARIS_PROJECT_NAME, POLARIS_SERVER_URL, polarisAssessmentTypes)
    info('Formatted command is - '.concat(formattedCommand))
  } else {
    warning('Not supported flow')
    return Promise.reject(new Error('Not Supported Flow'))
  }

  const sb = new SynopsysBridge()
  await sb.executeBridgeCommand(formattedCommand)

  cleanupTempDir(tempDir)
}

run()
