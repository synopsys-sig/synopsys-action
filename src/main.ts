import {info, setFailed} from '@actions/core'
import {cleanupTempDir, createTempDir, parseToBoolean} from './synopsys-action/utility'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import * as constants from './application-constants'
import * as inputs from './synopsys-action/inputs'
import {uploadDiagnostics, uploadSarifReportAsArtifact} from './synopsys-action/artifacts'
import {GithubClientService} from './synopsys-action/github-client-service'

export async function run() {
  info('Synopsys Action started...')
  const tempDir = await createTempDir()
  let formattedCommand = ''

  try {
    const sb = new SynopsysBridge()
    // Prepare bridge command
    formattedCommand = await sb.prepareCommand(tempDir)
    // Download bridge
    if (!inputs.ENABLE_NETWORK_AIR_GAP) {
      await sb.downloadBridge(tempDir)
    } else {
      info('Network air gap is enabled, skipping synopsys-bridge download.')
      await sb.validateSynopsysBridgePath()
    }
    // Execute bridge command
    const exitCode = await sb.executeBridgeCommand(formattedCommand, getWorkSpaceDirectory())
    if (exitCode === 0) {
      info('Synopsys Action workflow execution completed')
    }
    return exitCode
  } catch (error) {
    throw error
  } finally {
    if (inputs.INCLUDE_DIAGNOSTICS) {
      await uploadDiagnostics()
    }
    // Upload Black Duck sarif file as GitHub artifact
    if (parseToBoolean(inputs.BLACKDUCK_REPORTS_SARIF_CREATE)) {
      await uploadSarifReportAsArtifact(constants.BLACKDUCK_SARIF_GENERATOR_DIRECTORY, inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH, constants.BLACKDUCK_SARIF_ARTIFACT_NAME)
    }
    // Upload Black Duck SARIF Report to code scanning tab
    if (parseToBoolean(inputs.BLACKDUCK_UPLOAD_SARIF_REPORT)) {
      const gitHubClientService = new GithubClientService()
      await gitHubClientService.uploadSarifReport(constants.BLACKDUCK_SARIF_GENERATOR_DIRECTORY, inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH)
    }
    await cleanupTempDir(tempDir)
  }
}

export function logBridgeExitCodes(message: string): string {
  var exitCode = message.trim().slice(-1)
  return constants.EXIT_CODE_MAP.has(exitCode) ? 'Exit Code: ' + exitCode + ' ' + constants.EXIT_CODE_MAP.get(exitCode) : message
}

run().catch(error => {
  if (error.message != undefined) {
    setFailed('Workflow failed! '.concat(logBridgeExitCodes(error.message)))
  } else {
    setFailed('Workflow failed! '.concat(logBridgeExitCodes(error)))
  }
})
