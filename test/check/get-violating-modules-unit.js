import chai from 'chai'
import chaiSubset from 'chai-subset'
import map from 'lodash/fp/map'
import memo from 'memo-is'

import getViolatingModules from '../../src/check/get-violating-modules'

const { expect } = chai.use(chaiSubset)

describe('getting modules with violating license', () => {
  const licenseWhitelist = memo().is(() => [])
  const exceptionWhitelist = memo().is(() => [])
  const moduleWhitelist = memo().is(() => [])
  const moduleMap = memo().is(() => ({}))

  let result = null

  beforeEach(() => {
    const isModuleViolating = getViolatingModules(
      licenseWhitelist(), exceptionWhitelist(), moduleWhitelist())
    result = isModuleViolating(moduleMap())
  })

  describe('with simple license names', () => {
    licenseWhitelist.is(() => ['MIT'])

    moduleMap.is(() =>
      ({
        'module1@1': {
          licenseDescriptor: 'MIT',
          explicitName: 'module1@1',
        },
        'module2@1': {
          licenseDescriptor: 'JSON',
          explicitName: 'module2@1',
        },
        'module3@1': {
          licenseDescriptor: 'FOO',
          explicitName: 'module3@1',
        },
      }),
    )

    it('should return list of modules without whitelisted license', () =>
      expect(map('explicitName', result)).to.have.members([
        'module2@1', 'module3@1',
      ]),
    )

    it('should include license for each module', () =>
      expect(result).to.containSubset({
        'module2@1': {
          explicitName: 'module2@1',
          licenseDescriptor: 'JSON',
        },
        'module3@1': {
          explicitName: 'module3@1',
          licenseDescriptor: 'FOO',
        },
      }),
    )
  })

  describe('with SPDX expressions', () => {
    licenseWhitelist.is(() => ['MIT'])

    moduleMap.is(() =>
      ({
        'module1@1': {
          licenseDescriptor: 'MIT AND JSON',
          explicitName: 'module1@1',
        },
        'module2@1': {
          licenseDescriptor: 'MIT OR JSON',
          explicitName: 'module2@1',
        },
      }),
    )

    it('should return list of modules without whitelisted license', () =>
      expect(result).to.deep.equal({
        'module1@1': {
          explicitName: 'module1@1',
          licenseDescriptor: 'MIT AND JSON',
          otherUsedVersions: {},
        },
      }),
    )
  })

  describe('with module whitelist', () => {
    moduleWhitelist.is(() => [{
      name: 'module2',
      version: 1,
      licenseDescriptor: 'JSON',
    },
    ])

    moduleMap.is(() =>
      ({
        'module1@1': {
          name: 'module1',
          version: 1,
          licenseDescriptor: 'MIT',
        },
        'module2@1': {
          name: 'module2',
          version: 1,
          licenseDescriptor: 'JSON',
        },
      }),
    )

    it('should exclude whitelisted module', () => expect(map('explicitName', result)).to.not.contain('module2@1'))
  })

  describe('collect other versions', () => {
    licenseWhitelist.is(() => ['JSON'])

    moduleMap.is(() =>
      ({
        'module@1': {
          explicitName: 'module@1',
          name: 'module',
          version: '1',
          licenseDescriptor: 'MIT',
        },
        'module@2': {
          explicitName: 'module@2',
          name: 'module',
          version: '2',
          licenseDescriptor: 'JSON',
        },
      }),
    )

    it('should return list of modules without whitelisted license', () =>
      expect(result).to.containSubset({
        'module@1': {
          explicitName: 'module@1',
          otherUsedVersions: {
            2: {
              explicitName: 'module@2',
              name: 'module',
              version: '2',
              licenseDescriptor: 'JSON',
            },
          },
        },
      }),
    )
  })
})
