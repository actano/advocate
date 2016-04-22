{expect} = require 'chai'
sinon = require 'sinon'

describe 'guessing licenses of a module', ->

    guessModuleLicenseFactory = null

    before 'require', ->
        guessModuleLicenseFactory = require '../../lib/detect/guess-module-license'

    sandbox = null

    beforeEach 'sandbox', ->
        sandbox = sinon.sandbox.create()

    afterEach 'sandbox', ->
        sandbox.restore()

    guessModuleLicense = null
    fs = null

    beforeEach ->
        fs =
            readFileSync: sandbox.stub()
            readdirSync: sandbox.stub()
            existsSync: sandbox.stub()
        guessModuleLicense = guessModuleLicenseFactory fs

    it 'guesses no license', ->
        module =
            name: 'A'
        expect(guessModuleLicense module).to.be.null

    context 'via readme property', ->

        it 'guesses licenses', ->
            module =
                readme: '... MIT License ...'
            expect(guessModuleLicense module).have.members ['MIT*']

    context 'via files property', ->

        it 'guesses licenses by file content', ->
            module =
                path: '/some/dir'
                files: [
                    'README.txt'
                    'LICENCE.md'
                    'LICENSE.md'
                ]

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns '... MIT License ...'
                .withArgs('/some/dir/LICENSE.md').returns '... BSD License ...'
                .withArgs('/some/dir/LICENCE.md').returns '... Apache License Version 2.0  ...'

            expect(guessModuleLicense module).to.have.members ['MIT*', 'BSD*', 'Apache-2.0*']

        it 'guesses licenses by file name', ->
            module =
                path: '/some/dir'
                files: [
                    'MIT-LICENSE.txt'
                ]

            fs.readFileSync
            .withArgs('/some/dir/MIT-LICENCE.txt').returns '...'

            expect(guessModuleLicense module).to.have.members ['MIT*']

        it 'ignores files that don\'t match README or LICENSE naming', ->
            module =
                path: '/some/dir'
                files: [
                    'README.txt'
                    'IgnoreMe.txt'
                ]

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns '... MIT License ...'
                .withArgs('/some/dir/IgnoreMe.txt').returns '... BSD License ...'

            expect(guessModuleLicense module).to.not.contain 'BSD*'

    context 'via contents of module directory', ->

        it 'guesses licenses', ->
            module =
                path: '/some/dir'

            fs.existsSync.withArgs('/some/dir').returns true
            fs.readdirSync.withArgs('/some/dir').returns [
                'README.txt'
                'LICENSE.txt'
                'LICENCE.md'
            ]

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns '... MIT License ...'
                .withArgs('/some/dir/LICENSE.txt').returns '... BSD License ...'
                .withArgs('/some/dir/LICENCE.md').returns '... Apache License Version 2.0  ...'

            expect(guessModuleLicense module).to.have.members ['MIT*', 'BSD*', 'Apache-2.0*']

        it 'ignores files that don\'t match README or LICENSE naming', ->
            module =
                path: '/some/dir'

            fs.existsSync.withArgs('/some/dir').returns true
            fs.readdirSync.withArgs('/some/dir').returns [
                'README.txt'
                'IgnoreMe.txt'
            ]

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns '... MIT License ...'
                .withArgs('/some/dir/IgnoreMe.txt').returns '... BSD License ...'

            expect(guessModuleLicense module).to.not.contain 'BSD*'

        it 'ingores directory if it does not exist', ->
            module =
                path: '/some/dir'

            fs.existsSync.withArgs('/some/dir').returns false

            expect(guessModuleLicense module).to.equal null
