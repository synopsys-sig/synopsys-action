import {debug, info, setFailed} from '@actions/core'
import {cleanupTempDir, createTempDir, isPullRequestEvent, parseToBoolean} from './synopsys-action/utility'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {getGitHubWorkspaceDir as getGitHubWorkspaceDirV2} from 'actions-artifact-v2/lib/internal/shared/config'
import * as constants from './application-constants'
import * as inputs from './synopsys-action/inputs'
import {uploadDiagnostics, uploadSarifReportAsArtifact} from './synopsys-action/artifacts'
import {isNullOrEmptyValue} from './synopsys-action/validators'
import {GitHubClientServiceFactory} from './synopsys-action/factory/github-client-service-factory'

export async function run() {
  info('Synopsys Action started...')
  const tempDir = await createTempDir()
  let formattedCommand = ''
  let isBridgeExecuted = false
  let exitCode

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
    exitCode = await sb.executeBridgeCommand(formattedCommand, getGitHubWorkspaceDirV2())
    if (exitCode === 0) {
      isBridgeExecuted = true
      info('Synopsys Action workflow execution completed')
    }
    return exitCode
  } catch (error) {
    exitCode = getBridgeExitCodeAsNumericValue(error as Error)
    isBridgeExecuted = getBridgeExitCode(error as Error)
    throw error
  } finally {
    const uploadSarifReportBasedOnExitCode = exitCode === 0 || exitCode === 8
    debug(`Synopsys Bridge execution completed: ${isBridgeExecuted}`)
    if (isBridgeExecuted) {
      if (inputs.INCLUDE_DIAGNOSTICS) {
        await uploadDiagnostics()
      }
      if (!isPullRequestEvent() && uploadSarifReportBasedOnExitCode) {
        // Upload Black Duck sarif file as GitHub artifact
        if (inputs.BLACKDUCK_URL && parseToBoolean(inputs.BLACKDUCK_REPORTS_SARIF_CREATE) && isWaitForScanEnabled(inputs.BLACKDUCK_WAITFORSCAN)) {
          await uploadSarifReportAsArtifact(constants.BLACKDUCK_SARIF_GENERATOR_DIRECTORY, inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH, constants.BLACKDUCK_SARIF_ARTIFACT_NAME)
        }

        // Upload Polaris sarif file as GitHub artifact
        if (inputs.POLARIS_SERVER_URL && parseToBoolean(inputs.POLARIS_REPORTS_SARIF_CREATE) && isWaitForScanEnabled(inputs.POLARIS_WAITFORSCAN)) {
          await uploadSarifReportAsArtifact(constants.POLARIS_SARIF_GENERATOR_DIRECTORY, inputs.POLARIS_REPORTS_SARIF_FILE_PATH, constants.POLARIS_SARIF_ARTIFACT_NAME)
        }
        if (!isNullOrEmptyValue(inputs.GITHUB_TOKEN)) {
          // Upload Black Duck SARIF Report to code scanning tab
          if (inputs.BLACKDUCK_URL && parseToBoolean(inputs.BLACKDUCK_UPLOAD_SARIF_REPORT) && isWaitForScanEnabled(inputs.BLACKDUCK_WAITFORSCAN)) {
            const gitHubClientService = await GitHubClientServiceFactory.getGitHubClientServiceInstance()
            await gitHubClientService.uploadSarifReport(constants.BLACKDUCK_SARIF_GENERATOR_DIRECTORY, inputs.BLACKDUCK_REPORTS_SARIF_FILE_PATH)
          }
          // Upload Polaris SARIF Report to code scanning tab
          if (inputs.POLARIS_SERVER_URL && parseToBoolean(inputs.POLARIS_UPLOAD_SARIF_REPORT) && isWaitForScanEnabled(inputs.POLARIS_WAITFORSCAN)) {
            const gitHubClientService = await GitHubClientServiceFactory.getGitHubClientServiceInstance()
            await gitHubClientService.uploadSarifReport(constants.POLARIS_SARIF_GENERATOR_DIRECTORY, inputs.POLARIS_REPORTS_SARIF_FILE_PATH)
          }
        }
      }
    }
    await cleanupTempDir(tempDir)
  }
}

export function isWaitForScanEnabled(waitForScan: string): boolean {
  return waitForScan === 'true' || waitForScan === ''
}

export function logBridgeExitCodes(message: string): string {
  const exitCode = message.trim().slice(-1)
  return constants.EXIT_CODE_MAP.has(exitCode) ? `Exit Code: ${exitCode} ${constants.EXIT_CODE_MAP.get(exitCode)}` : message
}

export function getBridgeExitCodeAsNumericValue(error: Error): number {
  if (error.message !== undefined) {
    const lastChar = error.message.trim().slice(-1)
    const exitCode = parseInt(lastChar)
    return isNaN(exitCode) ? -1 : exitCode
  }
  return -1
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
