/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'

import guessModuleLicense from '../../src/detect/guess-module-license'

describe('guessing licenses of a module', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    sandbox.stub(fs, 'readFileSync')
    sandbox.stub(fs, 'readdirSync')
    sandbox.stub(fs, 'existsSync')
  })

  afterEach('sandbox', () => {
    sandbox.restore()
  })

  it('guesses no license', () => {
    const module =
      { name: 'A' }
    expect(guessModuleLicense(module)).to.be.null
  })

  context('via readme property', () => {
    it('guesses licenses', () => {
      const module =
        { readme: '... MIT License ...' }
      expect(guessModuleLicense(module)).have.members(['MIT*'])
    })
  })

  context('via files property', () => {
    it('guesses licenses by file content', () => {
      const module = {
        path: '/some/dir',
        files: [
          'README.txt',
          'LICENCE.md',
          'LICENSE.md',
        ],
      }

      fs.readFileSync
        .withArgs('/some/dir/README.txt')
        .returns('... MIT License ...')
        .withArgs('/some/dir/LICENSE.md')
        .returns('... BSD License ...')
        .withArgs('/some/dir/LICENCE.md')
        .returns('... Apache License Version 2.0  ...')

      expect(guessModuleLicense(module)).to.have.members(['MIT*', 'BSD*', 'Apache-2.0*'])
    })

    it('guesses licenses by file name', () => {
      const module = {
        path: '/some/dir',
        files: [
          'MIT-LICENSE.txt',
        ],
      }

      fs.readFileSync
        .withArgs('/some/dir/MIT-LICENCE.txt').returns('...')

      expect(guessModuleLicense(module)).to.have.members(['MIT*'])
    })

    it('ignores files that don\'t match README or LICENSE naming', () => {
      const module = {
        path: '/some/dir',
        files: [
          'README.txt',
          'IgnoreMe.txt',
        ],
      }

      fs.readFileSync
        .withArgs('/some/dir/README.txt').returns('... MIT License ...')
        .withArgs('/some/dir/IgnoreMe.txt').returns('... BSD License ...')

      expect(guessModuleLicense(module)).to.not.contain('BSD*')
    })
  })

  context('via contents of module directory', () => {
    it('guesses licenses', () => {
      const module =
        { path: '/some/dir' }

      fs.existsSync.withArgs('/some/dir').returns(true)
      fs.readdirSync.withArgs('/some/dir').returns([
        'README.txt',
        'LICENSE.txt',
        'LICENCE.md',
      ])

      fs.readFileSync
        .withArgs('/some/dir/README.txt')
        .returns('... MIT License ...')
        .withArgs('/some/dir/LICENSE.txt')
        .returns('... BSD License ...')
        .withArgs('/some/dir/LICENCE.md')
        .returns('... Apache License Version 2.0  ...')

      expect(guessModuleLicense(module)).to.have.members(['MIT*', 'BSD*', 'Apache-2.0*'])
    })

    it('ignores files that don\'t match README or LICENSE naming', () => {
      const module =
        { path: '/some/dir' }

      fs.existsSync.withArgs('/some/dir').returns(true)
      fs.readdirSync.withArgs('/some/dir').returns([
        'README.txt',
        'IgnoreMe.txt',
      ])

      fs.readFileSync
        .withArgs('/some/dir/README.txt').returns('... MIT License ...')
        .withArgs('/some/dir/IgnoreMe.txt').returns('... BSD License ...')

      expect(guessModuleLicense(module)).to.not.contain('BSD*')
    })

    it('ingores directory if it does not exist', () => {
      const module =
        { path: '/some/dir' }

      fs.existsSync.withArgs('/some/dir').returns(false)

      expect(guessModuleLicense(module)).to.equal(null)
    })
  })
})
