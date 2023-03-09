import {exec, ExecOptions} from '@actions/exec'
import {BRIDGE_DOWNLOAD_URL, SYNOPSYS_BRIDGE_PATH} from './inputs'
import {debug, error, info} from '@actions/core'
import {SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC, SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS} from '../application-constants'
import {tryGetExecutablePath} from '@actions/io/lib/io-util'
import path from 'path'
import {cleanupTempDir} from './utility'
import * as inputs from './inputs'
import {DownloadFileResponse, extractZipped, getRemoteFile} from './download-utility'
import fs from 'fs'
import {rmRF} from '@actions/io'
import {validateBlackDuckInputs, validateCoverityInputs, validatePolarisInputs, validateScanTypes} from './validators'
import {SynopsysToolsParameter} from './tools-parameter'
import * as constants from '../application-constants'
import {HttpClient} from 'typed-rest-client/HttpClient'
import DomParser from 'dom-parser'

export class SynopsysBridge {
  bridgeExecutablePath: string
  bridgeArtifactoryURL: string
  bridgeUrlPattern: string
  WINDOWS_PLATFORM = 'win64'
  LINUX_PLATFORM = 'linux64'
  MAC_PLATFORM = 'macosx'

  constructor() {
    this.bridgeExecutablePath = ''
    this.bridgeArtifactoryURL = 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action'
    this.bridgeUrlPattern = this.bridgeArtifactoryURL.concat('/$version/ci-package-$version-$platform.zip ')
  }

  private getBridgeDefaultPath(): string {
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

  private async checkIfSynopsysBridgeExists(): Promise<boolean> {
    let synopsysBridgePath = SYNOPSYS_BRIDGE_PATH
    const osName = process.platform
    if (!synopsysBridgePath) {
      info('Synopsys Bridge path not found in configuration')
      info('Looking for synopsys bridge in default path')
      synopsysBridgePath = this.getBridgeDefaultPath()
    }

    if (osName === 'win32') {
      this.bridgeExecutablePath = await tryGetExecutablePath(synopsysBridgePath.concat('\\synopsys-bridge'), ['.exe'])
    } else {
      this.bridgeExecutablePath = await tryGetExecutablePath(synopsysBridgePath.concat('/synopsys-bridge'), [])
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
          return await exec(this.bridgeExecutablePath.concat(' ', bridgeCommand), [], exectOp)
        } catch (errorObject) {
          throw errorObject
        }
      }
    } else {
      throw new Error('Bridge could not be found')
    }

    return -1
  }

  async downloadBridge(tempDir: string): Promise<void> {
    try {
      // Automatically configure bridge if Bridge download url is provided
      let bridgeUrl = ''

      if (inputs.BRIDGE_DOWNLOAD_VERSION) {
        if (await this.validateBridgeVersion(inputs.BRIDGE_DOWNLOAD_VERSION)) {
          bridgeUrl = this.getVersionUrl(inputs.BRIDGE_DOWNLOAD_VERSION.trim()).trim()
        } else {
          return Promise.reject(new Error('Provided bridge version not found in artifactory'))
        }
      } else if (inputs.BRIDGE_DOWNLOAD_URL) {
        bridgeUrl = BRIDGE_DOWNLOAD_URL
        info('Provided Bridge download url is - '.concat(inputs.BRIDGE_DOWNLOAD_URL))
      } else {
        info('Checking for latest version of Bridge to download and configure')
        const latestVersion = await this.getLatestVersion()
        bridgeUrl = this.getVersionUrl(latestVersion).trim()
      }

      info('Bridge URL is - '.concat(bridgeUrl))

      info('Downloading and configuring Synopsys Bridge')
      const downloadResponse: DownloadFileResponse = await getRemoteFile(tempDir, bridgeUrl)
      const extractZippedFilePath: string = inputs.SYNOPSYS_BRIDGE_PATH || this.getBridgeDefaultPath()

      // Clear the existing bridge, if available
      if (fs.existsSync(extractZippedFilePath)) {
        const files: string[] = fs.readdirSync(extractZippedFilePath)
        for (const file of files) {
          await rmRF(file)
        }
      }

      await extractZipped(downloadResponse.filePath, extractZippedFilePath)
      info('Download and configuration of Synopsys Bridge completed')
    } catch (e) {
      const errorObject = (e as Error).message
      await cleanupTempDir(tempDir)
      if (errorObject.includes('404') || errorObject.toLowerCase().includes('invalid url')) {
        let os = ''
        if (process.env['RUNNER_OS']) {
          os = process.env['RUNNER_OS']
        }
        return Promise.reject(new Error('Provided Bridge url is not valid for the configured '.concat(os, ' runner')))
      } else if (errorObject.toLowerCase().includes('empty')) {
        return Promise.reject(new Error('Provided Bridge URL cannot be empty'))
      } else {
        return Promise.reject(new Error(errorObject))
      }
    }
  }

  async prepareCommand(tempDir: string): Promise<string> {
    try {
      let formattedCommand = ''
      const invalidParams: string[] = validateScanTypes()
      if (invalidParams.length === 3) {
        return Promise.reject(new Error('Requires at least one scan type: ('.concat(constants.POLARIS_SERVER_URL_KEY).concat(',').concat(constants.COVERITY_URL_KEY).concat(',').concat(constants.BLACKDUCK_URL_KEY).concat(')')))
      }
      // validating and preparing command for polaris
      const polarisErrors: string[] = validatePolarisInputs()
      if (polarisErrors.length === 0 && inputs.POLARIS_SERVER_URL) {
        const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
        formattedCommand = formattedCommand.concat(polarisCommandFormatter.getFormattedCommandForPolaris())
      }

      // validating and preparing command for coverity
      const coverityErrors: string[] = validateCoverityInputs()
      if (coverityErrors.length === 0 && inputs.COVERITY_URL) {
        const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
        formattedCommand = formattedCommand.concat(coverityCommandFormatter.getFormattedCommandForCoverity())
      }

      // validating and preparing command for blackduck
      const blackduckErrors: string[] = validateBlackDuckInputs()
      if (blackduckErrors.length === 0 && inputs.BLACKDUCK_URL) {
        const blackDuckCommandFormatter = new SynopsysToolsParameter(tempDir)
        formattedCommand = formattedCommand.concat(blackDuckCommandFormatter.getFormattedCommandForBlackduck())
      }

      let validationErrors: string[] = []
      validationErrors = validationErrors.concat(polarisErrors)
      validationErrors = validationErrors.concat(coverityErrors)
      validationErrors = validationErrors.concat(blackduckErrors)
      if (formattedCommand.length === 0) {
        return Promise.reject(new Error(validationErrors.join(',')))
      }
      if (validationErrors.length > 0) {
        error(new Error(validationErrors.join(',')))
      }

      if (inputs.INCLUDE_DIAGNOSTICS) {
        formattedCommand = formattedCommand.concat(SynopsysToolsParameter.SPACE).concat(SynopsysToolsParameter.DIAGNOSTICS_OPTION)
      }

      debug('Formatted command is - '.concat(formattedCommand))
      return formattedCommand
    } catch (e) {
      const errorObject = e as Error
      await cleanupTempDir(tempDir)
      debug(errorObject.stack === undefined ? '' : errorObject.stack.toString())
      return Promise.reject(errorObject.message)
    }
  }

  async getLatestVersion(): Promise<string> {
    const versionArray: string[] = await this.getAllAvailableBridgeVersions()
    let latestVersion = '0.0.0'

    for (const version of versionArray) {
      if (version.localeCompare(latestVersion, undefined, {numeric: true, sensitivity: 'base'}) === 1) {
        latestVersion = version
      }
    }

    info('Available latest version is - '.concat(latestVersion))

    return latestVersion
  }

  private async getAllAvailableBridgeVersions(): Promise<string[]> {
    let htmlResponse = ''

    const httpClient = new HttpClient('synopsys-action')
    const httpResponse = await httpClient.get(this.bridgeArtifactoryURL, {Accept: 'text/html'})
    htmlResponse = await httpResponse.readBody()

    const domParser = new DomParser()
    const doms = domParser.parseFromString(htmlResponse)
    const elems = doms.getElementsByTagName('a') //querySelectorAll('a')
    const versionArray: string[] = []

    if (elems != null) {
      for (const el of elems) {
        const content = el.textContent
        if (content != null) {
          const v = content.match('^[0-9]+.[0-9]+.[0-9]+')

          if (v != null && v.length === 1) {
            versionArray.push(v[0])
          }
        }
      }
    }
    return versionArray
  }

  async validateBridgeVersion(version: string): Promise<boolean> {
    const versions = await this.getAllAvailableBridgeVersions()
    return versions.includes(version.trim())
  }

  getVersionUrl(version: string): string {
    const osName = process.platform

    let bridgeDownloadUrl = this.bridgeUrlPattern.replace('$version', version)
    bridgeDownloadUrl = bridgeDownloadUrl.replace('$version', version)
    if (osName === 'darwin') {
      bridgeDownloadUrl = bridgeDownloadUrl.replace('$platform', this.MAC_PLATFORM)
    } else if (osName === 'linux') {
      bridgeDownloadUrl = bridgeDownloadUrl.replace('$platform', this.LINUX_PLATFORM)
    } else if (osName === 'win32') {
      bridgeDownloadUrl = bridgeDownloadUrl.replace('$platform', this.WINDOWS_PLATFORM)
    }

    return bridgeDownloadUrl
  }
}
