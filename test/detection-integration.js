import chai from 'chai'
import path from 'path'
import makeModule from './_module'

import { readDependencyTree, extractModules } from '../src/lib/npm'

const { expect } = chai

const B = makeModule('b', '0.0.1', 'JSON AND MIT', { name: 'author' })
const C = makeModule('c', '0.0.1', 'Apache-2.0 WITH LZMA-exception')
const D = makeModule('d', '0.0.1')
const E = makeModule('e', '0.0.1', 'BSD OR Apache-2.0')
const F = makeModule('f', '0.0.1', 'MIT OR BSD OR Apache-2.0')
const G = makeModule('g', '0.0.1')

describe('detection integration test', () => {
  const modulePath = path.join(__dirname, 'integration-data/a')

  const readModules = async (dev) => {
    const tree = await readDependencyTree(dev, modulePath)
    return extractModules(tree)
  }

  context('production', () => {
    it('contains all modules and their license descriptors', async () => {
      const modules = await readModules(false)
      expect(modules).to.have.deep.members([B, C])
    })

    it('doesn\'t contain development dependencies and their dependecies', async () => {
      const modules = await readModules(false)
      expect(modules).to.not.have.deep.members([D, E, F, G])
    })
  })

  context('development', () => {
    it('contains all development dependencies and their production dependencies', async () => {
      const modules = await readModules(true)
      expect(modules).to.have.deep.members([E, F])
    })

    it('doesn\'t contain production dependencies and their dependencies', async () => {
      const modules = await readModules(true)
      expect(modules).to.not.have.members([B, C, D])
    })

    it('doesn\'t contain development dependencies of development dependecies', async () => {
      const modules = await readModules(true)
      expect(modules).to.not.have.members([G])
    })
  })
})
