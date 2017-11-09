import { existsSync } from 'fs'
import { join } from 'path'
import LDJSONStream from 'ld-jsonstream'
import execFile from './exec-file'

export const isYarnInUse = (path = '.') => existsSync(join(path, 'node_modules', '.yarn-integrity'))

const getTable = async ldjson => new Promise((resolve, reject) => {
  let hit = false
  const stream = new LDJSONStream()
  stream.on('data', ({ type, data }) => {
    if (type === 'table') {
      resolve(data)
      hit = true
    }
  })
  stream.write(ldjson)
  if (!hit) reject(new Error('Received no chunk of type table'))
})

export const getLicenses = async (dev, cwd = '.') => {
  const jsonStream = await execFile(cwd, 'yarn', '--json', '--no-progress', '--silent', 'licenses', 'list', dev ? '--dev' : '--prod')
  // expect(json).to.have.property('type', 'table')
  // expect(json).to.have.property('data').that.is.an('object')
  // expect(data).to.have.property('head').that.is.an('array')
  // .that.includes.members(['Name', 'Version', 'License'])
  // expect(data).to.have.property('body').that.is.an('array')
  const data = await getTable(jsonStream)
  const { head, body } = data
  const _name = head.indexOf('Name')
  const _version = head.indexOf('Version')
  const _license = head.indexOf('License')
  return body.map((module) => {
    const name = module[_name]
    const version = module[_version]
    const license = module[_license]
    return { name, version, license }
  })
}
