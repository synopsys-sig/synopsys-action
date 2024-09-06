import {BlackDuckArbitrary} from './blackduck'
import {CoverityArbitrary} from './coverity'
import {GithubData} from './github'
import {Reports} from './reports'
import {AsyncMode} from './async-mode'

export interface Polaris {
  polaris: PolarisData
  project?: ProjectData
  github?: GithubData
  coverity?: CoverityArbitrary
  blackduck?: BlackDuckArbitrary
}

export interface PolarisData extends AsyncMode {
  triage?: string
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  branch?: Branch
  assessment: {types: string[]}
  prComment?: PrComment
  test?: Test
  reports?: Reports
}

export interface ProjectData {
  directory?: string
  source?: {
    archive?: string
    preserveSymLinks?: boolean
    excludes?: string[]
  }
}

export interface PrComment {
  enabled?: boolean
  severities?: string[]
}

export interface Branch {
  name?: string
  parent?: {name?: string}
}

export interface Test {
  sca: {type: string}
}
