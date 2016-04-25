{expect} = require 'chai'

describe 'guess licenses from license file name', ->

    guessLicenseFilename = null

    before 'require', ->
        guessLicenseFilename = require '../../src/detect/guess-license-filename'

    it 'guess no license', ->
        filename = 'ReadMe.txt'
        expect(guessLicenseFilename filename).to.deep.equal []

    it 'guess license', ->
        filename = 'LICENSE-MIT'
        expect(guessLicenseFilename filename).to.deep.equal ['MIT*']
