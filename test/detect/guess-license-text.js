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

describe('guess licenses from licence/readme text', () => {
  let guessLicenseText = null

  before('require', () => guessLicenseText = require('../../src/detect/guess-license-text'))

  it('guess no license', () => {
    const text = '... MIT ...'
    expect(guessLicenseText(text)).to.deep.equal([])
  })

  it('guess single license', () => {
    const text = '... MIT License ...'
    expect(guessLicenseText(text)).to.deep.equal(['MIT*'])
  })

  it('guess multiple licenses', () => {
    const text = '... MIT License ... BSD License ... Apache License Version 2.0 ...'
    expect(guessLicenseText(text)).to.have.members(['MIT*', 'BSD*', 'Apache-2.0*'])
  })
})
