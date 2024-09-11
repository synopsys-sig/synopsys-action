export interface Branch {
  name: string
}

export interface Owner {
  name: string
}

export interface User {
  token: string
}

export interface Repository {
  name: string
  branch: Branch
  owner: Owner
  pull?: {number?: number}
}

export interface GithubURL {
  url: string
}

export interface GithubData {
  user: User
  repository: Repository
  host?: GithubURL
}
