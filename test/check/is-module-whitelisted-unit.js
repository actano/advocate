import { expect } from 'chai'
import memo from 'memo-is'
import isWhitelisted from '../../src/lib/module-whitelisted'

describe('module whitelist check', () => {
  const moduleWhitelist = memo().is(() => [])
  const isModuleWhitelisted = memo().is(() => module => isWhitelisted(moduleWhitelist(), module))

  describe('whitelist contains matching module', () => {
    moduleWhitelist.is(() => [{
      name: 'module1',
      version: '1',
      license: 'BSD',
    },
    {
      name: 'module2',
      version: '3',
      license: 'MIT',
    },
    ])

    it('returns true', () => {
      const module = {
        name: 'module2',
        version: '3',
        license: 'MIT',
      }

      expect(isModuleWhitelisted()(module)).to.eq(true)
    })
  })

  describe('given module has a mismatching property', () => {
    moduleWhitelist.is(() => [{
      name: 'module1',
      version: '1',
    },
    ])

    it('returns false on mismatching version', () => {
      const module = {
        name: 'module1',
        version: '2',
      }

      expect(isModuleWhitelisted()(module)).to.eq(false)
    })

    it('returns false on mismatching module name', () => {
      const module = {
        name: 'module2',
        version: '1',
      }

      expect(isModuleWhitelisted()(module)).to.eq(false)
    })
  })

  describe('given module has a missing property', () => {
    moduleWhitelist.is(() => [{
      name: 'module1',
      version: '1',
    },
    ])

    it('returns false on missing version', () => {
      const module = {
        name: 'module1',
      }

      expect(isModuleWhitelisted()(module)).to.eq(false)
    })

    it('returns false on missing name', () => {
      const module = {
        version: '1',
      }

      expect(isModuleWhitelisted()(module)).to.eq(false)
    })
  })
})
