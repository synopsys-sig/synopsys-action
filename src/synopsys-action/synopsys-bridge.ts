import {exec, ExecOptions} from '@actions/exec'
import {BRIDGE_DOWNLOAD_URL, ENABLE_NETWORK_AIR_GAP, SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY} from './inputs'
import {debug, error, info} from '@actions/core'
import {SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC, SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS} from '../application-constants'
import {tryGetExecutablePath} from '@actions/io/lib/io-util'
import path from 'path'
import {checkIfPathExists, cleanupTempDir} from './utility'
import * as inputs from './inputs'
import {DownloadFileResponse, extractZipped, getRemoteFile} from './download-utility'
import fs, {readFileSync} from 'fs'
import {rmRF} from '@actions/io'
import {validateBlackDuckInputs, validateCoverityInputs, validatePolarisInputs, validateScanTypes} from './validators'
import {SynopsysToolsParameter} from './tools-parameter'
import * as constants from '../application-constants'
import {HttpClient} from 'typed-rest-client/HttpClient'
import DomParser from 'dom-parser'

export class SynopsysBridge {
  bridgeExecutablePath: string
  synopsysBridgePath: string
  bridgeArtifactoryURL: string
  bridgeUrlPattern: string
  bridgeUrlLatestPattern: string
  WINDOWS_PLATFORM = 'win64'
  LINUX_PLATFORM = 'linux64'
  MAC_PLATFORM = 'macosx'

  constructor() {
    this.bridgeExecutablePath = ''
    this.synopsysBridgePath = ''
    this.bridgeArtifactoryURL = constants.SYNOPSYS_BRIDGE_ARTIFACTORY_URL
    this.bridgeUrlPattern = this.bridgeArtifactoryURL.concat('$version/synopsys-bridge-$version-$platform.zip')
    this.bridgeUrlLatestPattern = this.bridgeArtifactoryURL.concat('latest/synopsys-bridge-$platform.zip')
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

  async checkIfSynopsysBridgeExists(bridgeVersion: string): Promise<boolean> {
    await this.validateSynopsysBridgePath()
    const osName = process.platform
    let versionFilePath = ''
    let versionFileExists = false
    if (osName === 'win32') {
      versionFilePath = this.synopsysBridgePath.concat('\\versions.txt')
      versionFileExists = checkIfPathExists(versionFilePath)
    } else {
      versionFilePath = this.synopsysBridgePath.concat('/versions.txt')
      versionFileExists = checkIfPathExists(versionFilePath)
    }
    if (versionFileExists) {
      debug('Version file found at '.concat(this.synopsysBridgePath))
      if (await this.checkIfVersionExists(bridgeVersion, versionFilePath)) {
        return true
      }
    } else {
      debug('Synopsys Bridge version file could not be found at '.concat(this.synopsysBridgePath))
    }

    return false
  }

  async executeBridgeCommand(bridgeCommand: string, workingDirectory: string): Promise<number> {
    const osName: string = process.platform
    await this.setSynopsysBridgeExecutablePath()
    debug('Synopsys Bridge executable path:'.concat(this.synopsysBridgePath))
    if (!this.bridgeExecutablePath) {
      throw new Error('Synopsys Bridge executable could not be found at '.concat(this.synopsysBridgePath))
    }
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
    return -1
  }

  async downloadBridge(tempDir: string): Promise<void> {
    const LATEST = 'latest'
    try {
      // Automatically configure bridge if Bridge download url is provided
      let bridgeUrl = ''
      let bridgeVersion = ''
      if (inputs.BRIDGE_DOWNLOAD_URL) {
        bridgeUrl = BRIDGE_DOWNLOAD_URL
        if (bridgeUrl.includes(LATEST)) {
          bridgeVersion = await this.getSynopsysBridgeVersionFromLatestURL(bridgeUrl.substring(0, bridgeUrl.lastIndexOf(LATEST) + LATEST.length).concat('/versions.txt'))
        } else {
          const versionInfo = bridgeUrl.match('.*synopsys-bridge-([0-9.]*).*')
          if (versionInfo != null) {
            bridgeVersion = versionInfo[1]
          }
        }
      } else if (inputs.BRIDGE_DOWNLOAD_VERSION) {
        if (await this.validateBridgeVersion(inputs.BRIDGE_DOWNLOAD_VERSION)) {
          bridgeUrl = this.getVersionUrl(inputs.BRIDGE_DOWNLOAD_VERSION).trim()
          bridgeVersion = inputs.BRIDGE_DOWNLOAD_VERSION
        } else {
          return Promise.reject(new Error('Provided Synopsys Bridge version not found in artifactory'))
        }
      } else {
        info('Checking for latest version of Synopsys Bridge to download and configure')
        bridgeVersion = await this.getSynopsysBridgeVersionFromLatestURL(this.bridgeArtifactoryURL.concat('latest/versions.txt'))
        bridgeUrl = this.getLatestVersionUrl()
      }

      if (!(await this.checkIfSynopsysBridgeExists(bridgeVersion))) {
        info('Downloading and configuring Synopsys Bridge')
        info('Synopsys Bridge URL is - '.concat(bridgeUrl))
        const downloadResponse: DownloadFileResponse = await getRemoteFile(tempDir, bridgeUrl)
        const extractZippedFilePath: string = SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY || this.getBridgeDefaultPath()

        // Clear the existing bridge, if available
        if (fs.existsSync(extractZippedFilePath)) {
          const files: string[] = fs.readdirSync(extractZippedFilePath)
          for (const file of files) {
            await rmRF(file)
          }
        }
        await extractZipped(downloadResponse.filePath, extractZippedFilePath)

        info('Download and configuration of Synopsys Bridge completed')
      } else {
        info('Synopsys Bridge already exists, download has been skipped')
      }
    } catch (e) {
      const errorObject = (e as Error).message
      await cleanupTempDir(tempDir)
      if (errorObject.includes('404') || errorObject.toLowerCase().includes('invalid url')) {
        let os = ''
        if (process.env['RUNNER_OS']) {
          os = process.env['RUNNER_OS']
        }
        return Promise.reject(new Error('Provided Synopsys Bridge url is not valid for the configured '.concat(os, ' runner')))
      } else if (errorObject.toLowerCase().includes('empty')) {
        return Promise.reject(new Error('Provided Synopsys Bridge URL cannot be empty'))
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

  getLatestVersionUrl(): string {
    const osName = process.platform
    let bridgeDownloadUrl = this.bridgeUrlLatestPattern
    if (osName === 'darwin') {
      bridgeDownloadUrl = bridgeDownloadUrl.replace('$platform', this.MAC_PLATFORM)
    } else if (osName === 'linux') {
      bridgeDownloadUrl = bridgeDownloadUrl.replace('$platform', this.LINUX_PLATFORM)
    } else if (osName === 'win32') {
      bridgeDownloadUrl = bridgeDownloadUrl.replace('$platform', this.WINDOWS_PLATFORM)
    }

    return bridgeDownloadUrl
  }

  async checkIfVersionExists(bridgeVersion: string, bridgeVersionFilePath: string): Promise<boolean> {
    try {
      const contents = readFileSync(bridgeVersionFilePath, 'utf-8')
      return contents.includes('Synopsys Bridge Package: '.concat(bridgeVersion))
    } catch (e) {
      info('Error reading version file content: '.concat((e as Error).message))
    }
    return false
  }

  async getSynopsysBridgePath(): Promise<string> {
    let synopsysBridgePath = SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY

    if (!synopsysBridgePath) {
      synopsysBridgePath = this.getBridgeDefaultPath()
    }
    return synopsysBridgePath
  }

  async getSynopsysBridgeVersionFromLatestURL(latestVersionsUrl: string): Promise<string> {
    try {
      const httpClient = new HttpClient('')
      const httpResponse = await httpClient.get(latestVersionsUrl, {Accept: 'text/html'})
      if (httpResponse.message.statusCode === 200) {
        const htmlResponse = (await httpResponse.readBody()).trim()
        const lines = htmlResponse.split('\n')
        for (const line of lines) {
          if (line.includes('Synopsys Bridge Package')) {
            const newerVersion = line.split(':')[1].trim()
            return newerVersion
          }
        }
      } else {
        error('Unable to retrieve the most recent version from Artifactory URL')
      }
    } catch (e) {
      info('Error while reading version file content: '.concat((e as Error).message))
    }
    return ''
  }

  async validateSynopsysBridgePath(): Promise<void> {
    this.synopsysBridgePath = this.getBridgeDefaultPath()
    if (SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY) {
      this.synopsysBridgePath = SYNOPSYS_BRIDGE_INSTALL_DIRECTORY_KEY
      if (!checkIfPathExists(this.synopsysBridgePath)) {
        throw new Error('Synopsys Bridge Install Directory does not exist')
      }
    } else {
      if (ENABLE_NETWORK_AIR_GAP && !checkIfPathExists(this.getBridgeDefaultPath())) {
        throw new Error('Synopsys Bridge default directory does not exist')
      }
    }
  }

  private async setSynopsysBridgeExecutablePath(): Promise<void> {
    if (process.platform === 'win32') {
      this.bridgeExecutablePath = await tryGetExecutablePath(this.synopsysBridgePath.concat('\\synopsys-bridge'), ['.exe'])
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      this.bridgeExecutablePath = await tryGetExecutablePath(this.synopsysBridgePath.concat('/synopsys-bridge'), [])
    }
  }
}
