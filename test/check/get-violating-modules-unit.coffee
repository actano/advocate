sinon = require 'sinon'
{expect} = require 'chai'
    .use require 'chai-subset'
memo = require 'memo-is'
map = require 'lodash/fp/map'

describe 'getting modules with violating license', ->

    getViolatingModules = null

    before 'require', ->
        getViolatingModules = require '../../src/check/get-violating-modules'

    licenseWhitelist = memo().is -> []
    exceptionWhitelist = memo().is -> []
    moduleWhitelist = memo().is -> []
    moduleMap = memo().is -> {}

    result = null

    beforeEach ->
        isModuleViolating = getViolatingModules licenseWhitelist(), exceptionWhitelist(), moduleWhitelist()
        result = isModuleViolating moduleMap()

    describe 'with simple license names', ->

        licenseWhitelist.is -> ['MIT']

        moduleMap.is ->
            'module1@1':
                licenseDescriptor: 'MIT'
            'module2@1':
                licenseDescriptor: 'JSON'
            'module3@1':
                licenseDescriptor: 'FOO'

        it 'should return list of modules without whitelisted license', ->
            expect(map 'explicitName', result).to.have.members [
                'module2@1', 'module3@1'
            ]

        it 'should include license for each module', ->
            expect(result).to.containSubset [
                {
                    explicitName: 'module2@1'
                    licenseDescriptor: 'JSON'
                }
                {
                    explicitName: 'module3@1'
                    licenseDescriptor: 'FOO'
                }
            ]

    describe 'with SPDX expressions', ->

        licenseWhitelist.is -> ['MIT']

        moduleMap.is ->
            'module1@1':
                licenseDescriptor: 'MIT AND JSON'
            'module2@1':
                licenseDescriptor: 'MIT OR JSON'

        it 'should return list of modules without whitelisted license', ->
            expect(result).to.have.deep.members [
                {
                    explicitName: 'module1@1'
                    licenseDescriptor: 'MIT AND JSON'
                    otherUsedVersions: {}
                }
            ]

    describe 'with module whitelist', ->

        moduleWhitelist.is -> [
            name: 'module2'
            version: 1
            licenseDescriptor: 'JSON'
        ]

        moduleMap.is ->
            'module1@1':
                name: 'module1'
                version: 1
                licenseDescriptor: 'MIT'
            'module2@1':
                name: 'module2'
                version: 1
                licenseDescriptor: 'JSON'

        it 'should exclude whitelisted module', ->
            expect(map 'explicitName', result).to.not.contain 'module2@1'

    describe 'collect other versions', ->

        licenseWhitelist.is -> ['JSON']

        moduleMap.is ->
            'module@1':
                explicitName: 'module@1'
                name: 'module'
                version: '1'
                licenseDescriptor: 'MIT'
            'module@2':
                explicitName: 'module@2'
                name: 'module'
                version: '2'
                licenseDescriptor: 'JSON'

        it 'should return list of modules without whitelisted license', ->
            expect(result).to.containSubset [
                {
                    explicitName: 'module@1'
                    otherUsedVersions:
                        '2':
                            explicitName: 'module@2'
                            name: 'module'
                            version: '2'
                            licenseDescriptor: 'JSON'
                }
            ]
