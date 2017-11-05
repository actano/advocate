import chai from 'chai'
import memo from 'memo-is'
import path from 'path'

import { readDependencyTree, extractModules } from '../src/lib/npm'

const { expect } = chai

const B = { name: 'b', version: '0.0.1', license: 'JSON AND MIT' }
const C = { name: 'c', version: '0.0.1', license: 'Apache-2.0 WITH LZMA-exception' }
const D = { name: 'd', version: '0.0.1' }
const E = { name: 'e', version: '0.0.1', license: 'BSD OR Apache-2.0' }
const F = { name: 'f', version: '0.0.1', license: 'MIT OR BSD OR Apache-2.0' }
const G = { name: 'g', version: '0.0.1' }

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
      expect(modules).to.have.deep.members([B, C])
    })

    it('doesn\'t contain development dependencies and their dependecies', () => {
      expect(modules).to.not.have.deep.members([D, E, F, G])
    })
  })

  context('development', () => {
    dev.is(() => true)

    it('contains all development dependencies and their production dependencies', () => {
      expect(modules).to.have.deep.members([E, F])
    })

    it('doesn\'t contain production dependencies and their dependencies', () => {
      expect(modules).to.not.have.members([B, C, D])
    })

    it('doesn\'t contain development dependencies of development dependecies', () => {
      expect(modules).to.not.have.members([G])
    })
  })
})
