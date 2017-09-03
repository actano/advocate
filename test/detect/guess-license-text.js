import { expect } from 'chai'

import guessLicenseText from '../../src/detect/guess-license-text'

describe('guess licenses from licence/readme text', () => {
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
