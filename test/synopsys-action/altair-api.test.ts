import {AltairAPIService} from '../../src/synopsys-action/altair-api'
test('Test altair api callAltairFlow', () => {
  const altairObj = new AltairAPIService('http://altair-url.com')

  const returnedOutput = altairObj.callAltairFlow()
  expect(returnedOutput).toBe(true)
})
