export interface Reports {
  sarif?: Sarif
}

export interface Sarif {
  create?: boolean
  file?: File
  issue?: Issue
  severities?: string[]
  groupSCAIssues?: boolean
}

export interface File {
  path?: string
}

export interface Issue {
  types?: string[]
}
