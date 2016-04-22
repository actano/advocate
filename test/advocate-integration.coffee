{expect} = require 'chai'
    .use require 'chai-subset'
sinon = require 'sinon'
memo = require 'memo-is'
Promise = require 'bluebird'
path = require 'path'
map = require 'lodash/fp/map'

advocate = require '../lib/index'
testDataPath = path.join __dirname, 'integration-data/a'

describe 'advocate integration test', ->

    describe 'with missing parameters', ->

        context 'with no given parameters', ->
            it 'returns without error', Promise.coroutine ->
                options = {path: testDataPath}
                {allModules, violatingModules} = yield advocate()

                expect(violatingModules).to.be.an 'object'
                expect(allModules).to.be.an 'object'

        context 'with no given whitelist', ->
            it 'returns all production dependencies for given path', Promise.coroutine ->
                options = {path: testDataPath}
                {allModules, violatingModules} = yield advocate null, {path: testDataPath}

                expect(map 'explicitName', violatingModules).to.have.members [
                    'b@0.0.1'
                    'c@0.0.1'
                ]

        context 'with no given license whitelist', ->
            it 'returns all violating dependencies for given path', Promise.coroutine ->
                options = {path: testDataPath}
                whitelist =
                    modules: [
                        name: 'c'
                        version: '0.0.1'
                        licenseDescriptor: 'Apache-2.0 WITH LZMA-exception'
                    ]

                {allModules, violatingModules} = yield advocate whitelist, {path: testDataPath}

                expect(map 'explicitName', violatingModules).to.have.members [
                    'b@0.0.1'
                ]

    describe 'with all parameters', ->

        licenseWhitelist = memo().is -> []
        exceptionWhitelist = memo().is -> []
        moduleWhitelist = memo().is -> []
        violatingModules = null


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
