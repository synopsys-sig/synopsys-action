import {debug, info, setFailed} from '@actions/core'
import {cleanupTempDir, createTempDir, isPullRequestEvent, parseToBoolean} from './synopsys-action/utility'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import * as constants from './application-constants'
import * as inputs from './synopsys-action/inputs'
import {uploadDiagnostics, uploadSarifReportAsArtifact} from './synopsys-action/artifacts'
import {GithubClientService} from './synopsys-action/github-client-service'
import {isNullOrEmptyValue} from './synopsys-action/validators'

export async function run() {
  info('Synopsys Action started...')
  const tempDir = await createTempDir()
  let formattedCommand = ''
  let isBridgeExecuted = false

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
      isBridgeExecuted = true
      info('Synopsys Action workflow execution completed')
    }
    return exitCode
  } catch (error) {
    isBridgeExecuted = getBridgeExitCode(error as Error)
    throw error
  } finally {
    debug(`Synopsys Bridge execution completed: ${isBridgeExecuted}`)
    if (isBridgeExecuted) {
      if (inputs.INCLUDE_DIAGNOSTICS) {
        await uploadDiagnostics()
      }
      if (!isPullRequestEvent()) {
        // Upload Black Duck sarif file as GitHub artifact
        if (inputs.BLACKDUCK_URL && parseToBoolean(inputs.BLACKDUCK_REPORTS_SARIF_CREATE)) {
          await uploadSarifReportAsArtifact(constants.BLACKDUCK_SARIF_GENERATOR_DIRECTORY, inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH, constants.BLACKDUCK_SARIF_ARTIFACT_NAME)
        }

        // Upload Polaris sarif file as GitHub artifact
        if (inputs.POLARIS_SERVER_URL && parseToBoolean(inputs.POLARIS_REPORTS_SARIF_CREATE)) {
          await uploadSarifReportAsArtifact(constants.POLARIS_SARIF_GENERATOR_DIRECTORY, inputs.POLARIS_REPORTS_SARIF_FILE_PATH, constants.POLARIS_SARIF_ARTIFACT_NAME)
        }
        if (!isNullOrEmptyValue(inputs.GITHUB_TOKEN)) {
          // Upload Black Duck SARIF Report to code scanning tab
          if (inputs.BLACKDUCK_URL && parseToBoolean(inputs.BLACKDUCK_UPLOAD_SARIF_REPORT)) {
            const gitHubClientService = new GithubClientService()
            await gitHubClientService.uploadSarifReport(constants.BLACKDUCK_SARIF_GENERATOR_DIRECTORY, inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH)
          }
          // Upload Polaris SARIF Report to code scanning tab
          if (inputs.POLARIS_SERVER_URL && parseToBoolean(inputs.POLARIS_UPLOAD_SARIF_REPORT)) {
            const gitHubClientService = new GithubClientService()
            await gitHubClientService.uploadSarifReport(constants.POLARIS_SARIF_GENERATOR_DIRECTORY, inputs.POLARIS_REPORTS_SARIF_FILE_PATH)
          }
        }
      }
    }
    await cleanupTempDir(tempDir)
  }
}

export function logBridgeExitCodes(message: string): string {
  const exitCode = message.trim().slice(-1)
  return constants.EXIT_CODE_MAP.has(exitCode) ? `Exit Code: ${exitCode} ${constants.EXIT_CODE_MAP.get(exitCode)}` : message
}

export function getBridgeExitCode(error: Error): boolean {
  if (error.message !== undefined) {
    const lastChar = error.message.trim().slice(-1)
    const num = parseFloat(lastChar)
    return !isNaN(num)
  }
  return false
}

run().catch(error => {
  if (error.message != undefined) {
    setFailed('Workflow failed! '.concat(logBridgeExitCodes(error.message)))
  } else {
    setFailed('Workflow failed! '.concat(logBridgeExitCodes(error)))
  }
})
