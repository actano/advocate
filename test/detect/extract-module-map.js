{expect} = require 'chai'
    .use require 'chai-subset'
memo = require 'memo-is'

describe 'getting modules with violating license', ->

    extractModules = null

    before 'require', ->
        extractModules = require '../../src/detect/extract-module-map'

    it 'excludes root module from result', ->
        npmModuleMap =
            name: 'A'
            version: '1'
            dependencies: {}

        moduleMap = extractModules [npmModuleMap]

        expect(moduleMap).to.not.have.property 'A@1'

    describe 'guessing license', ->

        context 'via readmy property', ->

            it 'guesses an array of licenses', ->
                npmModuleMap =
                    name: 'A'
                    version: '1'
                    dependencies:
                        B:
                            name: 'B'
                            version: 1
                            readme: '... MIT License ... Apache License Version 2.0 ...'

                moduleMap = extractModules [npmModuleMap]

                expect(moduleMap).containSubset
                    'B@1':
                        licenseDescriptor: ['MIT*', 'Apache-2.0*']
                        isLicenseGuessed: true

    describe 'licenseDescriptor', ->

        npmModuleMap = null
        licenseProperty = memo().is -> {}

        beforeEach ->
            npmModuleMap =
                name: 'A'
                version: '1'
                dependencies:
                    B:
                        name: 'B'
                        version: 1

            Object.assign npmModuleMap.dependencies.B, licenseProperty()

        context 'with simple \'license\' property containing string', ->

            licenseProperty.is ->
                license: 'BSD'

            it 'detects as string', ->
                moduleMap = extractModules [npmModuleMap]

                expect(moduleMap['B@1'].licenseDescriptor).to.deep.equal 'BSD'

        context 'with simple \'licenses\' property containing string', ->

            licenseProperty.is ->
                licenses: 'BSD'

            it 'detects as string', ->
                moduleMap = extractModules [npmModuleMap]

                expect(moduleMap['B@1'].licenseDescriptor).to.deep.equal 'BSD'

        context 'with array of license strings', ->

            licenseProperty.is ->
                license: [ 'MIT', 'BSD' ]

            it 'detects as array of strings', ->
                moduleMap = extractModules [npmModuleMap]

                expect(moduleMap['B@1'].licenseDescriptor).to.have.members ['BSD', 'MIT']

        context 'with array of license objects', ->

            licenseProperty.is ->
                license: [
                    type: 'MIT'
                ,
                    name: 'BSD'
                ]

            it 'detects as array of strings', ->
                moduleMap = extractModules [npmModuleMap]

                expect(moduleMap['B@1'].licenseDescriptor).to.have.members ['BSD', 'MIT']

    describe 'dependencyPaths', ->

        it 'collect all dependecy paths', ->
            npmModuleMap =
                name: 'A'
                version: '1'
                dependencies:
                    A_1:
                        name: 'A_1'
                        version: 1
                        dependencies:
                            A_1_1:
                                name: 'A_1_1'
                                version: 1
                    A_1_1:
                        name: 'A_1_1'
                        version: 1

            moduleMap = extractModules [npmModuleMap]

            expect(moduleMap['A_1_1@1'].dependencyPaths).to.have.deep.members [
                ['A@1']
                ['A@1', 'A_1@1']
            ]

        it 'truncates cyclic dependencies', ->
            npmModuleMap =
                name: 'A'
                version: '1'
                dependencies:
                    A_1:
                        name: 'A_1'
                        version: 1
                        dependencies:
                            A_1_1:
                                name: 'A_1_1'
                                version: 1
                                dependencies:
                                    A_1:
                                        name: 'A_1'
                                        version: 1

            moduleMap = extractModules [npmModuleMap]

            expect(moduleMap['A_1_1@1'].dependencyPaths).to.have.deep.members [
                ['A@1', 'A_1@1']
            ]

    describe 'installPaths', ->

        module1 = memo().is ->
            name: 'A_1'
            version: 1

        module2 = memo().is ->
            name: 'A_1'
            version: 1

        moduleMap = null

        beforeEach ->
            npmModuleMap =
                name: 'A'
                version: '1'
                dependencies:
                    A_1: module1()
                    A_2:
                        name: 'A_2'
                        version: 1
                        path: '/path-to/a_2'
                        dependencies:
                            A_1: module2()

            moduleMap = extractModules [npmModuleMap]

        context 'same module and version with different paths', ->
            module1.is ->
                name: 'A_1'
                version: 1
                path: '/path-to/a_1/1'

            module2.is ->
                name: 'A_1'
                version: 1
                path: '/path-to/a_1/2'

            it 'includes all paths', ->
                expect(moduleMap['A_1@1'].installPaths).to.have.deep.members [
                    '/path-to/a_1/1'
                    '/path-to/a_1/2'
                ]

        context 'same module and version with same paths', ->

            module1.is ->
                name: 'A_1'
                version: 1
                path: '/path-to/a_1'

            module2.is ->
                name: 'A_1'
                version: 1
                path: '/path-to/a_1'

            it 'includes the same path only once', ->
                expect(moduleMap['A_1@1'].installPaths).to.have.length 1
                expect(moduleMap['A_1@1'].installPaths).to.have.deep.members [
                    '/path-to/a_1'
                ]

        context 'same module and different versions', ->
            module1.is ->
                name: 'A_1'
                version: 1
                path: '/path-to/a_1/1'

            module2.is ->
                name: 'A_1'
                version: 2
                path: '/path-to/a_1/2'

            it 'only includes paths of same module version', ->
                expect(moduleMap['A_1@1'].installPaths).to.have.deep.members [
                    '/path-to/a_1/1'
                ]

                expect(moduleMap['A_1@2'].installPaths).to.have.deep.members [
                    '/path-to/a_1/2'
                ]

    describe 'private', ->

        it 'ignore private modules but not their dependencies', ->
            npmModuleMap =
                name: 'A'
                version: '1'
                dependencies:
                    A_1:
                        name: 'A_1'
                        version: 1
                        private: true
                        dependencies:
                            A_1_1:
                                name: 'A_1_1'
                                version: 1

            moduleMap = extractModules [npmModuleMap]

            expect(moduleMap).to.not.have.property 'A_1@1'
            expect(moduleMap).to.have.property 'A_1_1@1'


    describe 'explicitName', ->

        it 'should have correct explicitName property', ->
            npmModuleMap =
                name: 'A'
                version: '1'
                dependencies:
                    A_1:
                        name: 'A_1'
                        version: 1

            moduleMap = extractModules [npmModuleMap]

            expect(moduleMap['A_1@1']).to.have.property 'explicitName', 'A_1@1'
