import {DefaultArtifactClient} from '@actions/artifact'
import {UploadArtifactResponse, UploadArtifactOptions} from '@actions/artifact/lib/internal/shared/interfaces'
import {getGitHubWorkspaceDir} from '@actions/artifact/lib/internal/shared/config'
import * as fs from 'fs'
import * as inputs from './inputs'
import {getDefaultSarifReportPath} from './utility'
import {warning, info} from '@actions/core'
import path from 'path'

export async function uploadDiagnostics(): Promise<UploadArtifactResponse | void> {
  const artifactClient = new DefaultArtifactClient()
  const pwd = getGitHubWorkspaceDir().concat(getBridgeDiagnosticsFolder())
  let files: string[] = []
  files = getFiles(pwd, files)
  const options: UploadArtifactOptions = {}
  // options.continueOnError = false
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

export async function uploadSarifReportAsArtifact(defaultSarifReportDirectory: string, userSarifFilePath: string, artifactName: string): Promise<UploadArtifactResponse> {
  const artifactClient = new DefaultArtifactClient()
  const sarifFilePath = userSarifFilePath ? userSarifFilePath : getDefaultSarifReportPath(defaultSarifReportDirectory, true)
  const rootDir = userSarifFilePath ? path.dirname(userSarifFilePath) : getDefaultSarifReportPath(defaultSarifReportDirectory, false)
  const options: UploadArtifactOptions = {}
  // options.continueOnError = false
  info('uploadSarifReportAsArtifact - artifactName '.concat(artifactName))
  info('uploadSarifReportAsArtifact - sarifFilePath '.concat(sarifFilePath))
  return await artifactClient.uploadArtifact(artifactName, ['/fake/path'], rootDir, options)
}
