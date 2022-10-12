import {validateBlackduckFailureSeverities, validateCoverityInstallDirectoryParam, validateInputs, validateParameters} from '../../src/synopsys-action/validators'
import * as constants from '../../src/application-constants'
import * as inputs from '../../src/synopsys-action/inputs'

test('Test missing install directory for coverity', () => {
  try {
    validateCoverityInstallDirectoryParam('')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('parameter for Coverity is missing')
  }
})

test('Test invalid install directory for coverity', () => {
  try {
    validateCoverityInstallDirectoryParam('D:/Users/tmpusr/Documents')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('parameter for Coverity is invalid')
  }
})

test('Test validate Blackduck Failure Severities', () => {
  const failureSeverities: string[] = []
  try {
    validateBlackduckFailureSeverities(failureSeverities)
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Provided value is not valid - BLACKDUCK_SCAN_FAILURE_SEVERITIES')
  }
})

test('Test validate parameters', () => {
  const paramsMap = new Map()
  paramsMap.set(constants.COVERITY_USER_KEY, null)
  paramsMap.set(constants.COVERITY_URL_KEY, '')
  try {
    validateParameters(paramsMap, 'Coverity')
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('required parameters for Coverity is missing')
  }
})
