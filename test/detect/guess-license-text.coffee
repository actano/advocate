{expect} = require 'chai'

describe 'guess licenses from licence/readme text', ->

    guessLicenseText = null

    before 'require', ->
        guessLicenseText = require '../../lib/detect/guess-license-text'

    it 'guess no license', ->
        text = '... MIT ...'
        expect(guessLicenseText text).to.deep.equal []

    it 'guess single license', ->
        text = '... MIT License ...'
        expect(guessLicenseText text).to.deep.equal ['MIT*']

    it 'guess multiple licenses', ->
        text = '... MIT License ... BSD License ... Apache License Version 2.0 ...'
        expect(guessLicenseText text).to.have.members ['MIT*', 'BSD*', 'Apache-2.0*']
