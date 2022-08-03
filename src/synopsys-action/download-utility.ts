import {info} from '@actions/core'
import path from 'path'
import {downloadTool, extractZip} from '@actions/tool-cache'
import * as fs from 'fs'

export interface DownloadFileResponse {
  filePath: string
  fileName: string
}

export async function getRemoteFile(destFilePath: string, url: string): Promise<DownloadFileResponse> {
  if (url == null || url.length === 0) {
    return Promise.reject(new Error('URL cannot be empty'))
  }

  try {
    let fileNameFromUrl = ''
    if (fs.lstatSync(destFilePath).isDirectory()) {
      fileNameFromUrl = url.substring(url.lastIndexOf('/') + 1)
      destFilePath = path.join(destFilePath, fileNameFromUrl)
    }

    const toolPath = await downloadTool(url, destFilePath)
    const downloadFileResp: DownloadFileResponse = {
      filePath: toolPath,
      fileName: fileNameFromUrl
    }

    return Promise.resolve(downloadFileResp)
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function extractZipped(file: string, destinationPath: string): Promise<boolean> {
  if (file == null || file.length === 0) {
    return Promise.reject(new Error('File does not exist'))
  }

  //Extract file name from file with full path
  if (destinationPath == null || destinationPath.length === 0) {
    return Promise.reject(new Error('No destination directory found'))
  }

  try {
    await extractZip(file, destinationPath)
    info('Extraction complete.')
    return Promise.resolve(true)
  } catch (error) {
    return Promise.reject(error)
  }
}
