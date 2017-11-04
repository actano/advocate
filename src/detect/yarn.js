import { execFile } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

export const isYarnInUse = (path = '.') => existsSync(join(path, 'node_modules', '.yarn-integrity'))

export const getLicenses = async (dev, cwd = '.') => {
  const json = await new Promise((resolve, reject) => {
    const args = ['--json', '--no-progress', '--offline', 'licenses', 'list']
    if (!dev) args.push('--prod')
    execFile('yarn', args, { cwd }, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })
  // expect(json).to.have.property('type', 'table')
  // expect(json).to.have.property('data').that.is.an('object')
  const { data } = json
  // expect(data).to.have.property('head').that.is.an('array')
  // .that.includes.members(['Name', 'Version', 'License'])
  // expect(data).to.have.property('body').that.is.an('array')
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
