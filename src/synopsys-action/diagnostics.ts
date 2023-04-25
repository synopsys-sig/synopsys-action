import * as artifact from '@actions/artifact'
import {UploadResponse} from '@actions/artifact/lib/internal/upload-response'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import * as fs from 'fs'
import * as inputs from './inputs'
import {UploadOptions} from '@actions/artifact/lib/internal/upload-options'
import {warning} from '@actions/core'

export async function uploadDiagnostics(): Promise<UploadResponse | void> {
  const artifactClient = artifact.create()
  const pwd = getWorkSpaceDirectory().concat(getBridgeDiagnosticsFolder())
  let files: string[] = []
  files = getFiles(pwd, files)
  const options: UploadOptions = {}
  options.continueOnError = false
  if (inputs.DIAGNOSTICS_RETENTION_DAYS) {
    if (!Number.isInteger(parseInt(inputs.DIAGNOSTICS_RETENTION_DAYS))) {
      warning('Invalid Diagnostics Retention Days, hence continuing with default 90 days')
    }
    options.retentionDays = parseInt(inputs.DIAGNOSTICS_RETENTION_DAYS)
  }
  if (files.length > 0) {
    return await artifactClient.uploadArtifact('bridge_diagnostics', files, pwd, options)
  }
}

function getBridgeDiagnosticsFolder(): string {
  if (process.platform === 'win32') {
    return '\\.bridge'
  } else {
    return '/.bridge'
  }
}

export function getFiles(dir: string, allFiles: string[]): string[] {
  allFiles = allFiles || []

  if (fs.existsSync(dir)) {
    const currDirFiles = fs.readdirSync(dir)
    for (const item of currDirFiles) {
      const name = dir.concat('/').concat() + item
      if (fs.statSync(name).isDirectory()) {
        getFiles(name, allFiles)
      } else {
        allFiles.push(name)
      }
    }
  }
  return allFiles
}
