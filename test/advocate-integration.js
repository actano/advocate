import chai from 'chai'
import chaiSubset from 'chai-subset'
import path from 'path'

import advocate from '../src/index'

const { expect } = chai.use(chaiSubset)

const testDataPathA = path.join(__dirname, 'integration-data/a')

const mapName = modules => Object.values(modules).map(module => `${module.name}@${module.version}`)

describe('advocate integration test', () => {
  describe('with missing parameters', () => {
    context('with no given parameters', () => {
      it('returns without error', async () => {
        const { allModules, violatingModules } = await advocate()

        expect(violatingModules).to.be.an('array')
        expect(allModules).to.be.an('array')
      })
    })

    context('with no given whitelist', () => {
      it('returns all production dependencies for given path', async () => {
        const { violatingModules } = await advocate(undefined, { path: testDataPathA })

        expect(mapName(violatingModules)).to.have.members([
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
          },
          ],
        }

        const { violatingModules } = await advocate(whitelist, { path: testDataPathA })

        expect(mapName(violatingModules)).to.have.members([
          'b@0.0.1',
        ])
      })
    })
  })

  describe('with all parameters', () => {
    const run = async (whitelist) => {
      const options = {
        dev: false,
        path: testDataPathA,
      }

      const result = await advocate(whitelist, options)
      const { violatingModules } = result
      return mapName(violatingModules)
    }

    describe('license whitelist', () => {
      it('contains violating modules', async () => {
        const licenses = ['MIT', 'JSON']
        const result = await run({ licenses })
        await expect(result)
          .to.be.an('array')
          .with.lengthOf(1)
          .and.have.members(['c@0.0.1'])
      })

      describe('in combination with exception white list', () => {
        it('contains violating modules', async () => {
          const licenses = ['Apache-2.0']
          const licenseExceptions = ['LZMA-exception']
          const result = await run({ licenses, licenseExceptions })
          expect(result)
            .to.be.an('array')
            .with.lengthOf(1)
            .and.have.members(['b@0.0.1'])
        })
      })
    })

    describe('module whitelist', () => {
      it('contains violating modules', async () => {
        const modules = [{
          name: 'b',
          version: '0.0.1',
        }]
        const result = await run({ modules })
        expect(result)
          .to.be.an('array')
          .with.lengthOf(1)
          .and.have.members(['c@0.0.1'])
      })
    })

    describe('authors whitelist', () => {
      it('contains violating modules', async () => {
        const authors = ['author']
        const result = await run({ authors })
        expect(result)
          .to.be.an('array')
          .with.lengthOf(1)
          .and.have.members(['c@0.0.1'])
      })
    })
  })
})
