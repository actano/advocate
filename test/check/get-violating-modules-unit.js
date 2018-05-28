import chai from 'chai'
import chaiSubset from 'chai-subset'
import memo from 'memo-is'

import getViolating from '../../src/lib/violating'

const { expect } = chai.use(chaiSubset)

const mapName = modules => Object.values(modules).map(module => `${module.name}@${module.version}`)

const getViolatingModules = (licenses, licenseExceptions, modules) => moduleMap =>
  getViolating({ licenses, licenseExceptions, modules }, Object.values(moduleMap))

describe('getting modules with violating license', () => {
  const licenseWhitelist = memo().is(() => [])
  const exceptionWhitelist = memo().is(() => [])
  const moduleWhitelist = memo().is(() => [])
  const moduleMap = memo().is(() => ({}))

  let result = null

  beforeEach(() => {
    const isModuleViolating = getViolatingModules(licenseWhitelist(), exceptionWhitelist(), moduleWhitelist())
    result = isModuleViolating(moduleMap())
  })

  describe('with simple license names', () => {
    licenseWhitelist.is(() => ['MIT'])

    moduleMap.is(() =>
      ({
        'module1@1': {
          license: 'MIT',
          name: 'module1',
          version: '1',
        },
        'module2@1': {
          license: 'JSON',
          name: 'module2',
          version: '1',
        },
        'module3@1': {
          license: 'FOO',
          name: 'module3',
          version: '1',
        },
      }))

    it('should return list of modules without whitelisted license', () =>
      expect(mapName(result)).to.have.members([
        'module2@1', 'module3@1',
      ]))

    it('should include license for each module', () =>
      expect(result).to.have.deep.members([
        {
          name: 'module2',
          version: '1',
          license: 'JSON',
        },
        {
          name: 'module3',
          version: '1',
          license: 'FOO',
        },
      ]))
  })

  describe('with SPDX expressions', () => {
    licenseWhitelist.is(() => ['MIT'])

    moduleMap.is(() =>
      ({
        'module1@1': {
          name: 'module1',
          version: '1',
          license: 'MIT AND JSON',
        },
        'module2@1': {
          name: 'module2',
          version: '1',
          license: 'MIT OR JSON',
        },
      }))

    it('should return list of modules without whitelisted license', () =>
      expect(result).to.deep.equal([
        {
          name: 'module1',
          version: '1',
          license: 'MIT AND JSON',
        },
      ]))
  })

  describe('with module whitelist', () => {
    moduleWhitelist.is(() => [{
      name: 'module2',
      version: 1,
      license: 'JSON',
    },
    ])

    moduleMap.is(() =>
      ({
        'module1@1': {
          name: 'module1',
          version: 1,
          license: 'MIT',
        },
        'module2@1': {
          name: 'module2',
          version: 1,
          license: 'JSON',
        },
      }))

    it('should exclude whitelisted module', () => expect(mapName(result)).to.not.contain('module2@1'))
  })

  describe('collect other versions', () => {
    licenseWhitelist.is(() => ['JSON'])

    moduleMap.is(() =>
      ({
        'module@1': {
          name: 'module',
          version: '1',
          license: 'MIT',
        },
        'module@2': {
          name: 'module',
          version: '2',
          license: 'JSON',
        },
      }))

    it('should return list of modules without whitelisted license', () =>
      expect(result).to.have.deep.members([
        {
          name: 'module',
          version: '1',
          license: 'MIT',
        },
      ]))
  })
})
