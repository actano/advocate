import isEqual from 'lodash/isEqual'
import isObject from 'lodash/isObject'
import execFile from './exec-file'

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

function* iterateDependencies(parent) {
  if (!parent.dependencies) return

  for (const module of Object.values(parent.dependencies)) {
    if (!module.private) {
      const explicitName = `${module.name}@${module.version}`

      const license = _extractLicenseName(
        module.license || module.licence || module.licenses || module.licences)

      yield {
        name: module.name,
        version: module.version,
        explicitName,
        license,
      }
    }
    yield* iterateDependencies(module)
  }
}

export const extractModules = (module) => {
  const moduleMap = {}
  const circulars = {}
  for (const _module of iterateDependencies(module)) {
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
  return execFile(cwd, 'npm', 'list', '--json', '--long', dev ? '--dev' : '--prod')
}

export default async (dev, path) => extractModules(await readDependencyTree(dev, path))
