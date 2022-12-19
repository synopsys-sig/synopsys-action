export interface Coverity {
  coverity: CoverityConnect
  project: ProjectData
}

export interface ProjectData {
  repository?: {name: string}
  branch?: {name: string}
}

export interface CoverityConnect {
  connect: CoverityData
  install?: {directory: string}
}

export interface CoverityData {
  user: {name: string; password: string}
  url: string
  project: {name: string}
  stream: {name: string}
  policy?: {view: string}
}
