/* eslint-disable
    global-require,
    import/first,
    no-unused-vars,
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

describe('detection integration test', () => {
  let readDependencyTree = null
  let extractModules = null
  const modulePath = path.join(__dirname, 'integration-data/a')

  before('require', () => {
    readDependencyTree = require('../src/detect/read-dependency-tree')
    extractModules = require('../src/detect/extract-module-map')
  })

  let modules = null
  const dev = memo().is(() => false)

  beforeEach(async () => {
    const tree = await readDependencyTree(dev(), modulePath)
    modules = extractModules([tree])
  })

  context('production', () => {
    dev.is(() => false)

    it('contains all modules and their license descriptors', () =>
      expect(modules).containSubset({
        'b@0.0.1': {
          licenseDescriptor: 'JSON AND MIT',
        },
        'c@0.0.1': {
          licenseDescriptor: 'Apache-2.0 WITH LZMA-exception',
        },
      }),
    )

    it('contains dependency paths', () =>
      expect(modules['c@0.0.1'].dependencyPaths).to.have.deep.members([
        ['a@0.0.1', 'b@0.0.1'],
      ]),
    )

    it('doesn\'t contain development dependencies and their dependecies', () => expect(modules).to.not.have.any.keys(['d@0.0.1', 'e@0.0.1', 'f@0.0.1', 'g@0.0.1']))
  })

  context('development', () => {
    dev.is(() => true)

    it('contains all development dependencies and their production dependencies', () => expect(modules).to.have.all.keys(['e@0.0.1', 'f@0.0.1']))

    it('doesn\'t contain production dependencies and their dependencies', () => expect(modules).to.not.have.any.keys(['b@0.0.1', 'c@0.0.1', 'd@0.0.1']))

    it('doesn\'t contain development dependencies of development dependecies', () => expect(modules).to.not.have.any.keys(['g@0.0.1']))
  })
})
