import { execFile } from 'child_process'
import isEqual from 'lodash/isEqual'
import isObject from 'lodash/isObject'

export const CIRCULAR = '[Circular]'

const _extractLicenseName = (license) => {
  if (!license) return null
  if (Array.isArray(license)) return license.map(_extractLicenseName)
  if (isObject(license)) return _extractLicenseName(license.type || license.name)
  return license
}

const check = (a, b, name) => {
  if (!isEqual(a, b)) throw new Error(`${name} mismatch: ${typeof a} ${a} !== ${typeof b} ${b}`)
}

const merge = (a, b) => {
  if (!b) return a
  for (const prop of ['name', 'version', 'explicitName', 'license']) {
    check(a[prop], b[prop], prop)
  }
  return a
}

function* iterateModules(name, module, parentPath) {
  if (!module.name) {
    // eslint-disable-next-line no-console
    console.error('WARNING: %s required from %s is missing', name, parentPath.join('->'))
    return
  }

  const explicitName = `${module.name}@${module.version}`
  // Abort recursion if cycle found
  if (parentPath.includes(explicitName)) return

  if (parentPath.length && !module.private) {
    const license = _extractLicenseName(
      module.license || module.licence || module.licenses || module.licences)

    yield {
      name: module.name,
      version: module.version,
      explicitName,
      license,
    }
  }
  if (!module.dependencies) return

  const subpath = [...parentPath, explicitName]
  for (const depName of Object.keys(module.dependencies)) {
    yield* iterateModules(depName, module.dependencies[depName], subpath)
  }
}

export const extractModules = (module) => {
  const moduleMap = {}
  const circulars = {}
  for (const _module of iterateModules('ROOT', module, [])) {
    const { explicitName, license } = _module
    if (license === CIRCULAR) {
      circulars[explicitName] = true
    } else {
      moduleMap[explicitName] = merge(_module, moduleMap[explicitName])
    }
  }
  for (const circular of Object.keys(circulars)) {
    if (!moduleMap[circular]) {
      throw new Error(`${circular} has only circular references, cannot determine license`)
    }
  }
  return moduleMap
}

export const readDependencyTree = async function (dev, cwd) {
  const maxBuffer = 26 * 1024 * 1024
  return new Promise((resolve, reject) => {
    const args = ['list', '--json', '--long', dev ? '--dev' : '--prod']
    execFile('npm', args, { cwd, maxBuffer }, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(JSON.parse(stdout))
      }
    })
  })
}

export default async (dev, path) => extractModules(await readDependencyTree(dev, path))
