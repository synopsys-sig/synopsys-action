export interface SRM {
  srm: SRMData
  coverity?: ExecutionPath
  blackduck?: ExecutionPath
}

export interface SRMData {
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
  parent?: string
}
