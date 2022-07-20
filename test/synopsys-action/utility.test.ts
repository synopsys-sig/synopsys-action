test('cleanUrl() trailing slash', () => {
    const utilitFunction = require('../../src/synopsys-action/utility')
  
    const validUrl = 'https://my-domain.com'
    const testUrl = `${validUrl}/`
    const cleanUrl = utilitFunction.cleanUrl(testUrl)
    expect(cleanUrl).toBe(validUrl)
  })
  
  test('cleanUrl() no trailing slash', () => {
    const utilitFunction = require('../../src/synopsys-action/utility')
  
    const testUrl = 'https://my-domain.com'
    const cleanUrl = utilitFunction.cleanUrl(testUrl)
    expect(cleanUrl).toBe(testUrl)
  })