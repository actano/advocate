import chai from 'chai'
import chaiSubset from 'chai-subset'
import memo from 'memo-is'
import util from 'util'

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
        const moduleMap = extractModules(npmModuleMap)

        expect(moduleMap['B@1'].license).to.deep.equal('BSD')
      })
    })

    context('with simple \'licenses\' property containing string', () => {
      licenseProperty.is(() => ({ licenses: 'BSD' }))

      it('detects as string', () => {
        const moduleMap = extractModules(npmModuleMap)

        expect(moduleMap['B@1'].license).to.deep.equal('BSD')
      })
    })

    context('with array of license strings', () => {
      licenseProperty.is(() => ({ license: ['MIT', 'BSD'] }))

      it('detects as array of strings', () => {
        const moduleMap = extractModules(npmModuleMap)

        expect(moduleMap['B@1'].license).to.have.members(['BSD', 'MIT'])
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
        const moduleMap = extractModules(npmModuleMap)

        expect(moduleMap['B@1'].license).to.have.members(['BSD', 'MIT'])
      })
    })
  })

  describe('private', () => {
    it('ignore private modules but not their dependencies', () => {
      const npmModuleMap = {
        name: 'A',
        version: '1',
        dependencies: {
          A_1: {
            name: 'A_1',
            version: 1,
            private: true,
            dependencies: {
              A_1_1: {
                name: 'A_1_1',
                version: 1,
              },
            },
          },
        },
      }

      const moduleMap = extractModules(npmModuleMap)

      expect(moduleMap).to.not.have.property('A_1@1')
      expect(moduleMap).to.have.property('A_1_1@1')
    })
  })

  describe('explicitName', () => {
    it('should have correct explicitName property', () => {
      const npmModuleMap = {
        name: 'A',
        version: '1',
        dependencies: {
          A_1: {
            name: 'A_1',
            version: 1,
          },
        },
      }

      const moduleMap = extractModules(npmModuleMap)

      expect(moduleMap['A_1@1']).to.have.property('explicitName', 'A_1@1')
    })
  })

  describe(`${CIRCULAR} dependencies`, () => {
    it(`should contain ${CIRCULAR} in circular references`, () => {
      const circular = {}
      circular.circular = circular
      expect(util.inspect(circular)).to.contain(CIRCULAR)
    })

    it('should throw when props differ', () => {
      const npmModuleMap = {
        name: 'A',
        version: '1',
        dependencies: {
          B1: {
            name: 'B',
            version: '1',
            license: 'MIT',
          },
          B2: {
            name: 'B',
            version: '1',
            license: 'BSD',
          },
        },
      }

      expect(() => extractModules(npmModuleMap)).to.throw()
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

      const moduleMap = extractModules(npmModuleMap)
      expect(moduleMap['B@1'].license).to.deep.equal('BSD')
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
