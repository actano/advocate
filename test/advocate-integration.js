/* eslint-disable
    import/first,
    no-unused-vars,
    prefer-const,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { expect } = require('chai')
  .use(require('chai-subset'))

import sinon from 'sinon'
import memo from 'memo-is'
import Promise from 'bluebird'
import path from 'path'
import map from 'lodash/fp/map'

import advocate from '../src/index'

const testDataPathA = path.join(__dirname, 'integration-data/a')
const testDataPathB = path.join(__dirname, 'integration-data/b')

describe('advocate integration test', () => {
  describe('with missing parameters', () => {
    context('with no given parameters', () =>
      it('returns without error', async () => {
        const options = { path: testDataPathA }
        const { allModules, violatingModules } = await advocate()

        expect(violatingModules).to.be.an('object')
        expect(allModules).to.be.an('object')
      },
      ),
    )

    context('with no given whitelist', () =>
      it('returns all production dependencies for given path', async () => {
        const options = { path: testDataPathA }
        const { allModules, violatingModules } = await advocate(null, { path: testDataPathA })

        expect(map('explicitName', violatingModules)).to.have.members([
          'b@0.0.1',
          'c@0.0.1',
        ])
      }),
    )

    context('with no given license whitelist', () =>
      it('returns all violating dependencies for given path', async () => {
        const options = { path: testDataPathA }
        const whitelist = {
          modules: [{
            name: 'c',
            version: '0.0.1',
            licenseDescriptor: 'Apache-2.0 WITH LZMA-exception',
          },
          ],
        }

        const { allModules, violatingModules } = await advocate(whitelist, { path: testDataPathA })

        expect(map('explicitName', violatingModules)).to.have.members([
          'b@0.0.1',
        ])
      }),
    )
  })

  describe('with all parameters', () => {
    const licenseWhitelist = memo().is(() => [])
    const exceptionWhitelist = memo().is(() => [])
    const moduleWhitelist = memo().is(() => [])
    let violatingModules = null


    beforeEach(async () => {
      let allModules
      const whitelist = {
        licenses: licenseWhitelist(),
        licenseExceptions: exceptionWhitelist(),
        modules: moduleWhitelist(),
      }

      const options = {
        dev: false,
        path: testDataPathA,
      };

      ({ allModules, violatingModules } = await advocate(whitelist, options))
    },
    )

    describe('license whitelist', () => {
      licenseWhitelist.is(() => ['MIT', 'JSON'])

      it('contains violating modules', () => expect(map('explicitName', violatingModules)).to.have.members(['c@0.0.1']))

      it('doesn\'t contains non-violating modules', () => expect(map('explicitName', violatingModules)).to.not.contain('b@0.0.1'))

      describe('in combination with exception white list', () => {
        licenseWhitelist.is(() => ['Apache-2.0'])
        exceptionWhitelist.is(() => ['LZMA-exception'])

        it('contains violating modules', () => expect(map('explicitName', violatingModules)).to.have.members(['b@0.0.1']))

        it('doesn\'t contains non-violating modules', () => expect(map('explicitName', violatingModules)).to.not.contain('c@0.0.1'))
      })
    })

    describe('module whitelist', () => {
      moduleWhitelist.is(() => [{
        name: 'b',
        version: '0.0.1',
        licenseDescriptor: 'JSON AND MIT',
      },
      ])

      it('contains violating modules', () => expect(map('explicitName', violatingModules)).to.have.members(['c@0.0.1']))

      it('doesn\'t contains non-violating modules', () => expect(map('explicitName', violatingModules)).to.not.contain('b@0.0.1'))
    })
  })

  describe('yarn.lock present', () =>

    it('should not throw error from npm list', async () => {
      let allModules
      const whitelist =
                { licenses: ['MIT', 'JSON'] }

      const options = {
        dev: false,
        path: testDataPathB,
      };

      ({ allModules } = await advocate(whitelist, options))
    },
    ),
  )
})
