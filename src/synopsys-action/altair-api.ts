import {info} from '@actions/core'

export class AltairAPIService {
  altairURL: string

  constructor(altairURL: string) {
    this.altairURL = altairURL
  }

  callAltairFlow(): boolean {
    info('Calling Altair flow')
    return true
  }
}
