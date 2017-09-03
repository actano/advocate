import chai from 'chai'
import chaiSubset from 'chai-subset'
import map from 'lodash/fp/map'
import memo from 'memo-is'
import path from 'path'

import advocate from '../src/index'

const { expect } = chai.use(chaiSubset)

const testDataPathA = path.join(__dirname, 'integration-data/a')
const testDataPathB = path.join(__dirname, 'integration-data/b')

describe('advocate integration test', () => {
  describe('with missing parameters', () => {
    context('with no given parameters', () => {
      it('returns without error', async () => {
        const { allModules, violatingModules } = await advocate()

        expect(violatingModules).to.be.an('object')
        expect(allModules).to.be.an('object')
      })
    })

    context('with no given whitelist', () => {
      it('returns all production dependencies for given path', async () => {
        const { violatingModules } = await advocate(null, { path: testDataPathA })

        expect(map('explicitName', violatingModules)).to.have.members([
          'b@0.0.1',
          'c@0.0.1',
        ])
      })
    })

    context('with no given license whitelist', () => {
      it('returns all violating dependencies for given path', async () => {
        const whitelist = {
          modules: [{
            name: 'c',
            version: '0.0.1',
            licenseDescriptor: 'Apache-2.0 WITH LZMA-exception',
          },
          ],
        }

        const { violatingModules } = await advocate(whitelist, { path: testDataPathA })

        expect(map('explicitName', violatingModules)).to.have.members([
          'b@0.0.1',
        ])
      })
    })
  })

  describe('with all parameters', () => {
    const licenseWhitelist = memo().is(() => [])
    const exceptionWhitelist = memo().is(() => [])
    const moduleWhitelist = memo().is(() => [])
    let violatingModules = null

    beforeEach(async () => {
      const whitelist = {
        licenses: licenseWhitelist(),
        licenseExceptions: exceptionWhitelist(),
        modules: moduleWhitelist(),
      }

      const options = {
        dev: false,
        path: testDataPathA,
      }

      const result = await advocate(whitelist, options)
      violatingModules = result.violatingModules
    })

    describe('license whitelist', () => {
      licenseWhitelist.is(() => ['MIT', 'JSON'])

      it('contains violating modules', () => {
        expect(map('explicitName', violatingModules)).to.have.members(['c@0.0.1'])
      })

      it('doesn\'t contains non-violating modules', () => {
        expect(map('explicitName', violatingModules)).to.not.contain('b@0.0.1')
      })

      describe('in combination with exception white list', () => {
        licenseWhitelist.is(() => ['Apache-2.0'])
        exceptionWhitelist.is(() => ['LZMA-exception'])

        it('contains violating modules', () => {
          expect(map('explicitName', violatingModules)).to.have.members(['b@0.0.1'])
        })

        it('doesn\'t contains non-violating modules', () => {
          expect(map('explicitName', violatingModules)).to.not.contain('c@0.0.1')
        })
      })
    })

    describe('module whitelist', () => {
      moduleWhitelist.is(() => [{
        name: 'b',
        version: '0.0.1',
        licenseDescriptor: 'JSON AND MIT',
      },
      ])

      it('contains violating modules', () => {
        expect(map('explicitName', violatingModules)).to.have.members(['c@0.0.1'])
      })

      it('doesn\'t contains non-violating modules', () => {
        expect(map('explicitName', violatingModules)).to.not.contain('b@0.0.1')
      })
    })
  })

  describe('yarn.lock present', () => {
    it('should not throw error from npm list', async () => {
      const whitelist = { licenses: ['MIT', 'JSON'] }

      const options = {
        dev: false,
        path: testDataPathB,
      }

      await advocate(whitelist, options)
    })
  })
})
