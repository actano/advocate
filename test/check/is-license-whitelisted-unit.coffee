sinon = require 'sinon'
{expect} = require 'chai'
memo = require 'memo-is'

describe 'license whitelist check', ->

    licenseWhitelist = memo().is -> []
    exceptionWhitelist = memo().is -> []
    isLicenseWhitelisted = null

    beforeEach ->
        isLicenseWhitelisted = require('../../lib/check/is-license-whitelisted') licenseWhitelist(), exceptionWhitelist()

    describe 'simple license name', ->

        context 'well known license', ->

            licenseWhitelist.is -> ['MIT']

            it 'should return true if name is whitelisted', ->
                expect(isLicenseWhitelisted 'MIT').to.be.true

            it 'should return false if name isn\'t whitelisted', ->
                expect(isLicenseWhitelisted 'JSON').to.be.false

        context 'random license name', ->

            licenseWhitelist.is -> ['FOO']

            it 'should return true if name is whitelisted', ->
                expect(isLicenseWhitelisted 'FOO').to.be.true

            it 'should return false if name isn\'t whitelisted', ->
                expect(isLicenseWhitelisted 'BAR').to.be.false

            it 'should return true if name is empty', ->
                expect(isLicenseWhitelisted '').to.be.false

            context 'non alpha numeric license name', ->
                licenseWhitelist.is -> ['($?!']

                it 'should return true if non alphanumeric name is whitelisted', ->
                    expect(isLicenseWhitelisted '($?!').to.be.true

    describe 'array of simple license names', ->

        licenseWhitelist.is -> ['FOO']

        it 'should return true if at least one name is whitelisted', ->
            expect(isLicenseWhitelisted ['BAR', 'FOO']).to.be.true

        it 'should return false if no name is whitelisted', ->
            expect(isLicenseWhitelisted ['BAR', 'BAZ']).to.be.false

        it 'should return false if the array is empty', ->
            expect(isLicenseWhitelisted []).to.be.false

    describe 'SPDX license expression', ->

        licenseWhitelist.is -> ['MIT', 'JSON']

        it 'should return true if SPDX expression evaluates to true', ->
            expect(isLicenseWhitelisted '(MIT+ AND (JSON OR AML))').to.be.true

        it 'should return false if SPDX expression evaluates to false', ->
            expect(isLicenseWhitelisted '(MIT+ AND (JSON AND AML))').to.be.false

        describe 'with exceptions', ->

            licenseWhitelist.is -> ['MIT']
            exceptionWhitelist.is -> ['LZMA-exception']

            it 'should return true if expression is using a whitelisted exception', ->
                expect(isLicenseWhitelisted 'MIT WITH LZMA-exception').to.be.true

            it 'should return false if expression isn\'t using a whitelisted exception', ->
                expect(isLicenseWhitelisted 'MIT WITH Libtool-exception').to.be.false
