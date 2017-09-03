import { expect } from 'chai'

import guessLicenseFilename from '../../src/detect/guess-license-filename'

describe('guess licenses from license file name', () => {
  it('guess no license', () => {
    const filename = 'ReadMe.txt'
    expect(guessLicenseFilename(filename)).to.deep.equal([])
  })

  it('guess license', () => {
    const filename = 'LICENSE-MIT'
    expect(guessLicenseFilename(filename)).to.deep.equal(['MIT*'])
  })
})
