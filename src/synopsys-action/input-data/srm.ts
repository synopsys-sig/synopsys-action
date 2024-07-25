export interface Srm {
  srm: SrmData
  coverity?: ExecutionPath
  blackduck?: ExecutionPath
}

export interface SrmData {
  url: string
  apikey: string
  project: {name: string}
  assessment: {types: string[]}
  branch?: Branch
}

export interface ExecutionPath {
  execution?: {path?: string}
}

export interface Branch {
  name?: string
  parent?: {name?: string}
}
