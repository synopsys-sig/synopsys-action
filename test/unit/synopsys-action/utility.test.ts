import {cleanUrl, isBoolean} from '../../../src/synopsys-action/utility'
test('cleanUrl() trailing slash', () => {
  const validUrl = 'https://my-domain.com'
  const testUrl = `${validUrl}/`
  const response = cleanUrl(testUrl)
  expect(response).toBe(validUrl)
})

test('cleanUrl() no trailing slash', () => {
  const testUrl = 'https://my-domain.com'
  const response = cleanUrl(testUrl)
  expect(response).toBe(testUrl)
})

describe('isBoolean', () => {
  it('should return true with string value as true', function () {
    const result = isBoolean('true')
    expect(result).toEqual(true)
  })

  it('should return true with boolean input as true', function () {
    const result = isBoolean(true)
    expect(result).toEqual(true)
  })

  it('should return true with string value as FALSE', function () {
    const result = isBoolean('FALSE')
    expect(result).toEqual(true)
  })

  it('should return true with boolean input as false', function () {
    const result = isBoolean(false)
    expect(result).toEqual(true)
  })

  it('should return false with any random string value', function () {
    const result = isBoolean('test')
    expect(result).toEqual(false)
  })
})
