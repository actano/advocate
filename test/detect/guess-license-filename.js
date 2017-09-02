/* eslint-disable
    global-require,
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { expect } from 'chai'

describe('guess licenses from license file name', () => {
  let guessLicenseFilename = null

  before('require', () => guessLicenseFilename = require('../../src/detect/guess-license-filename'))

  it('guess no license', () => {
    const filename = 'ReadMe.txt'
    expect(guessLicenseFilename(filename)).to.deep.equal([])
  })

  it('guess license', () => {
    const filename = 'LICENSE-MIT'
    expect(guessLicenseFilename(filename)).to.deep.equal(['MIT*'])
  })
})
