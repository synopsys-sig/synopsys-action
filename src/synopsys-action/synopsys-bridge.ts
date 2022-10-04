import {exec, ExecOptions} from '@actions/exec'
import {SYNOPSYS_BRIDGE_PATH} from './inputs'
import {debug, info} from '@actions/core'
import {SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC, SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS} from '../application-constants'
import {tryGetExecutablePath} from '@actions/io/lib/io-util'
import path from 'path'
import {checkIfGithubHostedAndLinux} from './utility'

export class SynopsysBridge {
  bridgeExecutablePath: string

  constructor() {
    this.bridgeExecutablePath = ''
  }

  private async checkIfSynopsysBridgeExists(): Promise<boolean> {
    let synopsysBridgePath = SYNOPSYS_BRIDGE_PATH
    const osName = process.platform
    if (!synopsysBridgePath) {
      info('Synopsys Bridge path not found in configuration')
      info('Looking for synopsys bridge in default path')
      synopsysBridgePath = getBridgeDefaultPath()
    }

    if (osName === 'win32') {
      this.bridgeExecutablePath = await tryGetExecutablePath(synopsysBridgePath.concat('\\bridge'), ['.exe'])
    } else {
      this.bridgeExecutablePath = await tryGetExecutablePath(synopsysBridgePath.concat('/bridge'), [])
    }

    if (this.bridgeExecutablePath) {
      debug('Bridge executable found at '.concat(synopsysBridgePath))
      return true
    } else {
      info('Bridge executable could not be found at '.concat(synopsysBridgePath))
    }

    return false
  }

  async executeBridgeCommand(bridgeCommand: string, workingDirectory: string): Promise<number> {
    if (await this.checkIfSynopsysBridgeExists()) {
      const osName: string = process.platform
      if (osName === 'darwin' || osName === 'linux' || osName === 'win32') {
        const exectOp: ExecOptions = {
          cwd: workingDirectory
        }
        try {
          if (checkIfGithubHostedAndLinux()) {
            return await exec('sudo '.concat(this.bridgeExecutablePath.concat(' ', bridgeCommand)), [], exectOp)
          }

          return await exec(this.bridgeExecutablePath.concat(' ', bridgeCommand), [], exectOp)
        } catch (error) {
          throw error
        }
      }
    } else {
      throw new Error('Bridge could not be found')
    }

    return -1
  }
}

export function getBridgeDefaultPath(): string {
  let bridgeDefaultPath = ''
  const osName = process.platform

  if (osName === 'darwin') {
    bridgeDefaultPath = path.join(process.env['HOME'] as string, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC)
  } else if (osName === 'linux') {
    bridgeDefaultPath = path.join(process.env['HOME'] as string, SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX)
  } else if (osName === 'win32') {
    bridgeDefaultPath = path.join(process.env['USERPROFILE'] as string, SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS)
  }

  return bridgeDefaultPath
}

export function validateBridgeURL(url: string): boolean {
  const osName = process.platform

  if (osName === 'darwin') {
    return url.toLowerCase().includes('mac')
  } else if (osName === 'linux') {
    return url.toLowerCase().includes('linux')
  } else if (osName === 'win32') {
    return url.toLowerCase().includes('win')
  }

  return false
}
