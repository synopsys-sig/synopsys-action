import {UploadArtifactResponse, UploadArtifactOptions} from 'actions-artifact-v2/lib/internal/shared/interfaces'
import {getGitHubWorkspaceDir} from 'actions-artifact-v2/lib/internal/shared/config'
import * as fs from 'fs'
import * as inputs from './inputs'
import {getDefaultSarifReportPath, isGitHubCloud} from './utility'
import {warning} from '@actions/core'
import path from 'path'
import * as artifact from 'actions-artifact-v1'
import {DefaultArtifactClient} from 'actions-artifact-v2'

export async function uploadDiagnostics(): Promise<UploadArtifactResponse | void> {
  let artifactClient
  let options: UploadArtifactOptions | artifact.UploadOptions = {}

  if (isGitHubCloud()) {
    artifactClient = new DefaultArtifactClient()
  } else {
    artifactClient = artifact.create()
    options = {
      continueOnError: true
    } as artifact.UploadOptions
  }
  const pwd = getGitHubWorkspaceDir().concat(getBridgeDiagnosticsFolder())
  let files: string[] = []
  files = getFiles(pwd, files)

  if (inputs.DIAGNOSTICS_RETENTION_DAYS) {
    const retentionDays = parseInt(inputs.DIAGNOSTICS_RETENTION_DAYS)
    if (!Number.isInteger(retentionDays)) {
      warning('Invalid Diagnostics Retention Days, hence continuing with default 90 days')
    } else {
      options.retentionDays = retentionDays
    }
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

export async function uploadSarifReportAsArtifact(defaultSarifReportDirectory: string, userSarifFilePath: string, artifactName: string): Promise<UploadArtifactResponse> {
  let artifactClient
  let options: artifact.UploadOptions = {}
  if (isGitHubCloud()) {
    artifactClient = new DefaultArtifactClient()
  } else {
    artifactClient = artifact.create()
    options = {
      continueOnError: true
    } as artifact.UploadOptions
  }
  const sarifFilePath = userSarifFilePath ? userSarifFilePath : getDefaultSarifReportPath(defaultSarifReportDirectory, true)
  const rootDir = userSarifFilePath ? path.dirname(userSarifFilePath) : getDefaultSarifReportPath(defaultSarifReportDirectory, false)
  return await artifactClient.uploadArtifact(artifactName, [sarifFilePath], rootDir, options)
}
