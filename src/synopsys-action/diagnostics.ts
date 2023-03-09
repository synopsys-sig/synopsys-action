import * as artifact from '@actions/artifact'
import {UploadResponse} from '@actions/artifact/lib/internal/upload-response'
import {getWorkSpaceDirectory} from '@actions/artifact/lib/internal/config-variables'
import * as fs from 'fs'
import * as inputs from './inputs'
import {UploadOptions} from '@actions/artifact/lib/internal/upload-options'

export async function uploadDiagnostics(): Promise<UploadResponse> {
  const artifactClient = artifact.create()
  const pwd = getWorkSpaceDirectory().concat('/.bridge/')
  let files: string[] = []
  files = getFiles(pwd, files)
  const options: UploadOptions = {}
  options.continueOnError = false
  if (inputs.DIAGNOSTICS_RETENTION_DAYS) {
    options.retentionDays = parseInt(inputs.DIAGNOSTICS_RETENTION_DAYS)
  }
  return await artifactClient.uploadArtifact('bridge_diagnostics', files, pwd, options)
}

export function getFiles(dir: string, allFiles: string[]): string[] {
  allFiles = allFiles || []
  const currDirFiles = fs.readdirSync(dir)
  for (const item of currDirFiles) {
    const name = dir.concat('/').concat() + item
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, allFiles)
    } else {
      allFiles.push(name)
    }
  }
  return allFiles
}
