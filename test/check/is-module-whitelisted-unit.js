/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import memo from 'memo-is'
import _isModuleWhitelisted from '../../src/check/is-module-whitelisted'

describe('module whitelist check', () => {
  const moduleWhitelist = memo().is(() => [])
  const isModuleWhitelisted = memo().is(() => _isModuleWhitelisted(moduleWhitelist()))

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

      expect(isModuleWhitelisted()(module)).to.be.true
    })
  })

  describe('given module has a mismatching property', () => {
    moduleWhitelist.is(() => [{
      name: 'module1',
      version: '1',
      license: 'BSD',
    },
    ])

    it('returns false on mismatching license', () => {
      const module = {
        name: 'module1',
        version: '1',
        license: 'MIT',
      }

      expect(isModuleWhitelisted()(module)).to.be.false
    })

    it('returns false on mismatching version', () => {
      const module = {
        name: 'module1',
        version: '2',
        license: 'BSD',
      }

      expect(isModuleWhitelisted()(module)).to.be.false
    })

    it('returns false on mismatching module name', () => {
      const module = {
        name: 'module2',
        version: '1',
        license: 'BSD',
      }

      expect(isModuleWhitelisted()(module)).to.be.false
    })
  })

  describe('given module has a missing property', () => {
    moduleWhitelist.is(() => [{
      name: 'module1',
      version: '1',
      license: 'BSD',
    },
    ])

    it('returns false on missing license', () => {
      const module = {
        name: 'module1',
        version: '1',
      }

      expect(isModuleWhitelisted()(module)).to.be.false
    })

    it('returns false on missing version', () => {
      const module = {
        name: 'module1',
        license: 'BSD',
      }

      expect(isModuleWhitelisted()(module)).to.be.false
    })

    it('returns false on missing name', () => {
      const module = {
        version: '1',
        license: 'BSD',
      }

      expect(isModuleWhitelisted()(module)).to.be.false
    })
  })

  describe('license property', () => {
    describe('simple string in whitelisted license', () => {
      moduleWhitelist.is(() => [{
        name: 'module1',
        version: '1',
        license: 'BSD',
      },
      ])

      it('returns true for array with single matching license', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: ['BSD'],
        }

        expect(isModuleWhitelisted()(module)).to.be.true
      })

      it('returns false for array with multiple licenses', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: ['BSD', 'MIT'],
        }

        expect(isModuleWhitelisted()(module)).to.be.false
      })
    })

    describe('null in whitelisted license', () => {
      moduleWhitelist.is(() => [{
        name: 'module1',
        version: '1',
        license: null,
      },
      ])

      it('returns true for matching license', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: null,
        }

        expect(isModuleWhitelisted()(module)).to.be.true
      })

      it('returns false for not matching license', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: 'BSD',
        }

        expect(isModuleWhitelisted()(module)).to.be.false
      })
    })

    describe('single element array in whitelisted license', () => {
      moduleWhitelist.is(() => [{
        name: 'module1',
        version: '1',
        license: ['BSD'],
      },
      ])

      it('returns true for matching array', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: ['BSD'],
        }

        expect(isModuleWhitelisted()(module)).to.be.true
      })

      it('returns true for single matchting value', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: 'BSD',
        }

        expect(isModuleWhitelisted()(module)).to.be.true
      })
    })

    describe('multiple element array in whitelisted license', () => {
      moduleWhitelist.is(() => [{
        name: 'module1',
        version: '1',
        license: ['JSON', 'BSD'],
      },
      ])

      it('returns true for matching array with different order', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: ['BSD', 'JSON'],
        }

        expect(isModuleWhitelisted()(module)).to.be.true
      })

      it('returns false for different array', () => {
        const module = {
          name: 'module1',
          version: '1',
          license: ['BSD', 'MIT'],
        }

        expect(isModuleWhitelisted()(module)).to.be.false
      })
    })
  })
})
