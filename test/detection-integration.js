import chai from 'chai'
import chaiSubset from 'chai-subset'
import memo from 'memo-is'
import path from 'path'

import readDependencyTree from '../src/detect/read-dependency-tree'
import extractModules from '../src/detect/extract-module-map'

const { expect } = chai.use(chaiSubset)

describe('detection integration test', () => {
  const modulePath = path.join(__dirname, 'integration-data/a')

  let modules = null
  const dev = memo().is(() => false)

  beforeEach(async () => {
    const tree = await readDependencyTree(dev(), modulePath)
    modules = extractModules(tree)
  })

  context('production', () => {
    dev.is(() => false)

    it('contains all modules and their license descriptors', () => {
      expect(modules).containSubset({
        'b@0.0.1': {
          licenseDescriptor: 'JSON AND MIT',
        },
        'c@0.0.1': {
          licenseDescriptor: 'Apache-2.0 WITH LZMA-exception',
        },
      })
    })

    it('doesn\'t contain development dependencies and their dependecies', () => {
      expect(modules).to.not.have.any.keys(['d@0.0.1', 'e@0.0.1', 'f@0.0.1', 'g@0.0.1'])
    })
  })

  context('development', () => {
    dev.is(() => true)

    it('contains all development dependencies and their production dependencies', () => {
      expect(modules).to.have.all.keys(['e@0.0.1', 'f@0.0.1'])
    })

    it('doesn\'t contain production dependencies and their dependencies', () => {
      expect(modules).to.not.have.any.keys(['b@0.0.1', 'c@0.0.1', 'd@0.0.1'])
    })

    it('doesn\'t contain development dependencies of development dependecies', () => {
      expect(modules).to.not.have.any.keys(['g@0.0.1'])
    })
  })
})
