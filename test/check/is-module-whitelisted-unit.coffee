sinon = require 'sinon'
{expect} = require 'chai'
memo = require 'memo-is'

describe 'module whitelist check', ->

    moduleWhitelist = memo().is -> []
    isModuleWhitelisted = null

    beforeEach ->
        isModuleWhitelisted = require('../../src/check/is-module-whitelisted') moduleWhitelist()

    describe 'whitelist contains matching module', ->

        moduleWhitelist.is -> [
            name: 'module1'
            version: '1'
            licenseDescriptor: 'BSD'
        ,
            name: 'module2'
            version: '3'
            licenseDescriptor: 'MIT'
        ]

        it 'returns true', ->
            module =
                name: 'module2'
                version: '3'
                licenseDescriptor: 'MIT'

            expect(isModuleWhitelisted module).to.be.true

    describe 'given module has a mismatching property', ->

        moduleWhitelist.is -> [
            name: 'module1'
            version: '1'
            licenseDescriptor: 'BSD'
        ]

        it 'returns false on mismatching license', ->
            module =
                name: 'module1'
                version: '1'
                licenseDescriptor: 'MIT'

            expect(isModuleWhitelisted module).to.be.false

        it 'returns false on mismatching version', ->
            module =
                name: 'module1'
                version: '2'
                licenseDescriptor: 'BSD'

            expect(isModuleWhitelisted module).to.be.false

        it 'returns false on mismatching module name', ->
            module =
                name: 'module2'
                version: '1'
                licenseDescriptor: 'BSD'

            expect(isModuleWhitelisted module).to.be.false

    describe 'given module has a missing property', ->

        moduleWhitelist.is -> [
            name: 'module1'
            version: '1'
            licenseDescriptor: 'BSD'
        ]

        it 'returns false on missing license', ->
            module =
                name: 'module1'
                version: '1'

            expect(isModuleWhitelisted module).to.be.false

        it 'returns false on missing version', ->
            module =
                name: 'module1'
                licenseDescriptor: 'BSD'

            expect(isModuleWhitelisted module).to.be.false

        it 'returns false on missing name', ->
            module =
                version: '1'
                licenseDescriptor: 'BSD'

            expect(isModuleWhitelisted module).to.be.false

    describe 'license property', ->

        describe 'simple string in whitelisted license', ->

            moduleWhitelist.is -> [
                name: 'module1'
                version: '1'
                licenseDescriptor: 'BSD'
            ]

            it 'returns true for array with single matching license', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: ['BSD']

                expect(isModuleWhitelisted module).to.be.true

            it 'returns false for array with multiple licenses', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: ['BSD', 'MIT']

                expect(isModuleWhitelisted module).to.be.false

        describe 'null in whitelisted license', ->

            moduleWhitelist.is -> [
                name: 'module1'
                version: '1'
                licenseDescriptor: null
            ]

            it 'returns true for matching license', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: null

                expect(isModuleWhitelisted module).to.be.true

            it 'returns false for not matching license', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: 'BSD'

                expect(isModuleWhitelisted module).to.be.false

        describe 'single element array in whitelisted license', ->

            moduleWhitelist.is -> [
                name: 'module1'
                version: '1'
                licenseDescriptor: ['BSD']
            ]

            it 'returns true for matching array', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: ['BSD']

                expect(isModuleWhitelisted module).to.be.true

            it 'returns true for single matchting value', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: 'BSD'

                expect(isModuleWhitelisted module).to.be.true

        describe 'multiple element array in whitelisted license', ->

            moduleWhitelist.is -> [
                name: 'module1'
                version: '1'
                licenseDescriptor: ['JSON', 'BSD']
            ]

            it 'returns true for matching array with different order', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: ['BSD', 'JSON']

                expect(isModuleWhitelisted module).to.be.true

            it 'returns false for different array', ->
                module =
                    name: 'module1'
                    version: '1'
                    licenseDescriptor: ['BSD', 'MIT']

                expect(isModuleWhitelisted module).to.be.false
