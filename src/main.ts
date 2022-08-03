import {debug, info, warning} from '@actions/core'
import {AltairAPIService} from './synopsys-action/altair-api'
import {ALTAIR_URL} from './synopsys-action/inputs'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'

async function run() {
  info('Basic Action running')

  const altairURL = ALTAIR_URL
  debug('Provided Altair URL is - ' + altairURL)

  const sb = new SynopsysBridge()
  await sb.executeBridgeCommand('--help')

  if (altairURL) {
    let altairObj = new AltairAPIService(altairURL)
    altairObj.callAltairFlow()
  } else {
    warning('Not supported flow')
    return Promise.reject(new Error('Not Supported Flow'))
  }
}

run()
