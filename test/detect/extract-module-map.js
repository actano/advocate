import chai from 'chai'
import chaiSubset from 'chai-subset'
import memo from 'memo-is'
import util from 'util'
import makeModule from '../_module'

import { extractModules, CIRCULAR } from '../../src/lib/npm'

const { expect } = chai
  .use(chaiSubset)

describe('getting modules with violating license', () => {
  it('excludes root module from result', () => {
    const npmModuleMap = {
      name: 'A',
      version: '1',
      dependencies: {},
    }

    const moduleMap = extractModules(npmModuleMap)

    expect(moduleMap).to.not.have.property('A@1')
  })

  describe('license', () => {
    let npmModuleMap = null
    const licenseProperty = memo().is(() => ({}))

    beforeEach(() => {
      npmModuleMap = {
        name: 'A',
        version: '1',
        dependencies: {
          B: {
            name: 'B',
            version: 1,
          },
        },
      }

      Object.assign(npmModuleMap.dependencies.B, licenseProperty())
    })

    context('with simple \'license\' property containing string', () => {
      licenseProperty.is(() => ({ license: 'BSD' }))

      it('detects as string', () => {
        const modules = extractModules(npmModuleMap)
        expect(modules).to.deep.include(makeModule('B', '1', 'BSD'))
      })
    })

    context('with simple \'licenses\' property containing string', () => {
      licenseProperty.is(() => ({ licenses: 'BSD' }))

      it('detects as string', () => {
        const modules = extractModules(npmModuleMap)
        expect(modules).to.deep.include(makeModule('B', '1', 'BSD'))
      })
    })

    context('with array of license strings', () => {
      licenseProperty.is(() => ({ license: ['MIT', 'BSD'] }))

      it('detects as array of strings', () => {
        const modules = extractModules(npmModuleMap)
        expect(modules).to.deep.include(makeModule('B', '1', ['MIT', 'BSD']))
      })
    })

    context('with array of license objects', () => {
      licenseProperty.is(() =>
        ({
          license: [
            { type: 'MIT' },
            { name: 'BSD' },
          ],
        }))

      it('detects as array of strings', () => {
        const modules = extractModules(npmModuleMap)
        expect(modules).to.deep.include(makeModule('B', '1', ['MIT', 'BSD']))
      })
    })
  })

  describe(`${CIRCULAR} dependencies`, () => {
    it(`should contain ${CIRCULAR} in circular references`, () => {
      const circular = {}
      circular.circular = circular
      expect(util.inspect(circular)).to.contain(CIRCULAR)
    })

    it(`should drop ${CIRCULAR} licenses`, () => {
      const npmModuleMap = {
        name: 'A',
        version: '1',
        dependencies: {
          B1: {
            name: 'B',
            version: '1',
            license: CIRCULAR,
          },
          B2: {
            name: 'B',
            version: '1',
            license: 'BSD',
          },
        },
      }

      const modules = extractModules(npmModuleMap)
      expect(modules).to.deep.include(makeModule('B', '1', 'BSD'))
    })

    it(`should throw if only ${CIRCULAR} licenses are present`, () => {
      const npmModuleMap = {
        name: 'A',
        version: '1',
        dependencies: {
          B1: {
            name: 'B',
            version: '1',
            license: CIRCULAR,
          },
        },
      }

      expect(() => extractModules(npmModuleMap)).to.throw()
    })
  })
})
