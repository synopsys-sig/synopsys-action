import {info} from '@actions/core'
import path from 'path'
import {extractZip} from '@actions/tool-cache'
import {downloadTool} from './tool-cache-local'
import * as fs from 'fs'
import {validateBridgeUrl} from './validators'
import * as constants from '../application-constants'

export interface DownloadFileResponse {
  filePath: string
  fileName: string
}

export async function getRemoteFile(destFilePath: string, url: string): Promise<DownloadFileResponse> {
  if (url == null || url.length === 0) {
    throw new Error(constants.BRIDGE_URL_EMPTY_ERROR)
  }

  if (!validateBridgeUrl(url)) {
    throw new Error(constants.BRIDGE_URL_NOT_VALID_ERROR)
  }

  try {
    let fileNameFromUrl = ''
    if (fs.lstatSync(destFilePath).isDirectory()) {
      fileNameFromUrl = url.substring(url.lastIndexOf('/') + 1)
      destFilePath = path.join(destFilePath, fileNameFromUrl || 'bridge.zip')
    }

    const toolPath = await downloadTool(url, destFilePath)
    const downloadFileResp: DownloadFileResponse = {
      filePath: toolPath,
      fileName: fileNameFromUrl
    }
    return Promise.resolve(downloadFileResp)
  } catch (error) {
    throw error
  }
}

export async function extractZipped(file: string, destinationPath: string): Promise<boolean> {
  if (file == null || file.length === 0) {
    return Promise.reject(new Error(constants.BRIDGE_ZIP_NOT_FOUND_FOR_EXTRACT_ERROR))
  }

  //Extract file name from file with full path
  if (destinationPath == null || destinationPath.length === 0) {
    return Promise.reject(new Error(constants.BRIDGE_EXTRACT_directory_NOT_FOUND_ERROR))
  }

  try {
    await extractZip(file, destinationPath)
    info('Extraction complete.')
    return Promise.resolve(true)
  } catch (error) {
    return Promise.reject(error)
  }
}
