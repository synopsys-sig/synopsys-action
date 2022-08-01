import {debug, info, warning} from '@actions/core'
import {AltairAPIService} from './synopsys-action/altair-api'
import {ALTAIR_URL, SYNOPSYS_BRIDGE_PATH} from './synopsys-action/inputs'
import {extractZipped, getRemoteFile} from './synopsys-action/download-utility'
// import {MAC_SYNOPSYS_BRIDGE_PATH} from './application-constants'
import {SynopsysBridge} from './synopsys-action/synopsys-bridge'

async function run() {
  info('Basic Action running')

  const altairURL = ALTAIR_URL
  debug('Provided Altair URL is - ' + altairURL)

  // const synopsysBridgePath = '';
  const sb = new SynopsysBridge()
  await sb.executeBridgeCommand('--help')

  // info('Start downloading and extracting zipped file')
  // const url = 'https://artifactory.internal.synopsys.com/artifactory/clops-local/clops.sig.synopsys.com/bridge/0.1.700/bridge-0.1.700-win64.zip'
  // const filePath = MAC_SYNOPSYS_BRIDGE_PATH
  // const fileResponse = await getRemoteFile(filePath, url)
  // // const fileResp = await DownloadUtility.getRemoteFile(file, url);
  // debug('Downloaded file with file path - ' + fileResponse.filePath)
  // const resp = await extractZipped(fileResponse.fileName, filePath)
  //
  // info('Extracted and download file is complete - ' + resp)

  if (altairURL) {
    let altairObj = new AltairAPIService(altairURL)
    altairObj.callAltairFlow()
  } else {
    warning('Not supported flow')
    return Promise.reject(new Error('Not Supported Flow'))
  }
}

run()
