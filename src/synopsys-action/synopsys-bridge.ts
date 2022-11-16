import {exec, ExecOptions} from '@actions/exec'
import {BRIDGE_DOWNLOAD_URL, SYNOPSYS_BRIDGE_PATH} from './inputs'
import {debug, info} from '@actions/core'
import {SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC, SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS} from '../application-constants'
import {tryGetExecutablePath} from '@actions/io/lib/io-util'
import path from 'path'
import {checkIfGithubHostedAndLinux, cleanupTempDir} from './utility'
import * as inputs from './inputs'
import {DownloadFileResponse, extractZipped, getRemoteFile} from './download-utility'
import fs from 'fs'
import {rmRF} from '@actions/io'
import {validateBlackDuckInputs, validateCoverityInputs, validatePolarisInputs} from './validators'
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
          /*if (checkIfGithubHostedAndLinux()) {
            return await exec('sudo '.concat(this.bridgeExecutablePath.concat(' ', bridgeCommand)), [], exectOp)
          }*/

          return await exec(this.bridgeExecutablePath.concat(' ', bridgeCommand).concat(' --verbose'), [], exectOp)
        } catch (error) {
          throw error
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
      const error = (e as Error).message
      await cleanupTempDir(tempDir)
      if (error.includes('404') || error.toLowerCase().includes('invalid url')) {
        let os = ''
        if (process.env['RUNNER_OS']) {
          os = process.env['RUNNER_OS']
        }
        return Promise.reject(new Error('Provided Bridge url is not valid for the configured '.concat(os, ' runner')))
      } else if (error.toLowerCase().includes('empty')) {
        return Promise.reject(new Error('Provided Bridge URL cannot be empty'))
      } else {
        return Promise.reject(new Error(error))
      }
    }
  }

  async prepareCommand(tempDir: string): Promise<string> {
    try {
      let formattedCommand = ''
      if (inputs.POLARIS_SERVER_URL == null && inputs.COVERITY_URL == null && inputs.BLACKDUCK_URL == null) {
        return Promise.reject(new Error('Requires at least one scan type: ('.concat(constants.POLARIS_SERVER_URL_KEY).concat(',').concat(constants.COVERITY_URL_KEY).concat(',').concat(constants.BLACKDUCK_URL_KEY).concat(')')))
      }

      // validating and preparing command for polaris
      if (validatePolarisInputs()) {
        const polarisCommandFormatter = new SynopsysToolsParameter(tempDir)
        formattedCommand = formattedCommand.concat(polarisCommandFormatter.getFormattedCommandForPolaris())
        debug('Formatted command is - '.concat(formattedCommand))
      }

      // validating and preparing command for coverity
      if (validateCoverityInputs()) {
        const coverityCommandFormatter = new SynopsysToolsParameter(tempDir)
        formattedCommand = formattedCommand.concat(coverityCommandFormatter.getFormattedCommandForCoverity())
      }

      // validating and preparing command for blackduck
      if (validateBlackDuckInputs()) {
        const blackDuckCommandFormatter = new SynopsysToolsParameter(tempDir)
        formattedCommand = formattedCommand.concat(blackDuckCommandFormatter.getFormattedCommandForBlackduck())
      }

      if (formattedCommand.length === 0) {
        return Promise.reject(new Error('Mandatory fields are missing for given scan[s]'))
      }
      return formattedCommand
    } catch (e) {
      const error = e as Error
      await cleanupTempDir(tempDir)
      debug(error.stack === undefined ? '' : error.stack.toString())
      return Promise.reject(error.message)
    }
  }

  async getLatestVersion(): Promise<string> {
    const versionArray: string[] = await this.getAllAvailableBridgeVersions()
    let latestVersion = '0.0.0'

    for (const version of versionArray) {
      if (version > latestVersion) {
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
