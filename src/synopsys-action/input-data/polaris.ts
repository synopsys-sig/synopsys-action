export interface Polaris {
  polaris: PolarisData
}

export interface PolarisData {
  triage?: string
  accesstoken: string
  serverUrl: string
  application: {name: string}
  project: {name: string}
  assessment: {types: string[]}
}
