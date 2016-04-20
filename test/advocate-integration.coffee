{expect} = require 'chai'
    .use require 'chai-subset'
sinon = require 'sinon'
memo = require 'memo-is'
Promise = require 'bluebird'
path = require 'path'
map = require 'lodash/fp/map'

advocate = require '../src/index'
testDataPath = path.join __dirname, 'integration-data/a'

describe 'advocate integration test', ->

    licenseWhitelist = memo().is -> []
    exceptionWhitelist = memo().is -> []
    moduleWhitelist = memo().is -> []
    violatingModules = null

    describe 'with all parameters', ->

        beforeEach Promise.coroutine ->
            whitelist =
                licenses: licenseWhitelist()
                licenseExceptions: exceptionWhitelist()
                modules: moduleWhitelist()

            options =
                dev: false
                path: testDataPath

            {allModules, violatingModules} = yield advocate whitelist, options

        describe 'license whitelist', ->
            licenseWhitelist.is -> ['MIT', 'JSON']

            it 'contains violating modules', ->
                expect(map 'explicitName', violatingModules).to.have.members ['c@0.0.1']

            it 'doesn\'t contains non-violating modules', ->
                expect(map 'explicitName', violatingModules).to.not.contain 'b@0.0.1'

            describe 'in combination with exception white list', ->
                licenseWhitelist.is -> ['Apache-2.0']
                exceptionWhitelist.is -> ['LZMA-exception']

                it 'contains violating modules', ->
                    expect(map 'explicitName', violatingModules).to.have.members ['b@0.0.1']

                it 'doesn\'t contains non-violating modules', ->
                    expect(map 'explicitName', violatingModules).to.not.contain 'c@0.0.1'

        describe 'module whitelist', ->
            moduleWhitelist.is -> [
                name: 'b'
                version: '0.0.1'
                licenseDescriptor: 'JSON AND MIT'
            ]

            it 'contains violating modules', ->
                expect(map 'explicitName', violatingModules).to.have.members ['c@0.0.1']

            it 'doesn\'t contains non-violating modules', ->
                expect(map 'explicitName', violatingModules).to.not.contain 'b@0.0.1'
