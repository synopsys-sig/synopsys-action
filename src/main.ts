import {info, setFailed} from '@actions/core'
import {cleanupTempDir, createTempDir} from './synopsys-action/utility'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'

export async function run() {
  info('Synopsys Action started...')
  const tempDir = await createTempDir()
  let formattedCommand = ''
  try {
    const sb = new SynopsysBridge()
    // Download bridge
    await sb.downloadBridge(tempDir)
    // Prepare bridge command
    formattedCommand = await sb.prepareCommand(tempDir)
    // Execute bridge command
    await sb.executeBridgeCommand(formattedCommand, getWorkSpaceDirectory())
  } catch (error) {
    throw error
  } finally {
    await cleanupTempDir(tempDir)
  }
}

run().catch(error => {
  if (error.message !== undefined) {
    setFailed('Workflow failed! '.concat(error.message))
  } else {
    setFailed('Workflow failed! '.concat(error))
  }
})
