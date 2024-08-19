import {BlackDuckArbitrary} from './blackduck'
import {CoverityArbitrary} from './coverity'
import {AsyncMode} from './async-mode'

export interface SRM {
  srm: SRMData
  project?: ProjectData
  coverity?: CoverityData
  blackduck?: BlackduckData
}

export interface SRMData extends AsyncMode {
  url: string
  apikey: string
  project?: {id?: string; name?: string}
  assessment: {types: string[]}
  branch?: Branch
}

export interface ProjectData {
  directory?: string
}

export interface Branch {
  name?: string
  parent?: string
}

export interface ExecutionPath {
  execution?: {path?: string}
}

export interface BlackduckData extends ExecutionPath, BlackDuckArbitrary {}

export interface CoverityData extends ExecutionPath, CoverityArbitrary {}
