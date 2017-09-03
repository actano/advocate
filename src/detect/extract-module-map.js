import isObject from 'lodash/isObject'
import isEqual from 'lodash/isEqual'
import uniq from 'lodash/uniq'

import guessModuleLicense from './guess-module-license'

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
  if (!a) return b
  for (const prop of ['name', 'version', 'explicitName', 'licenseDescriptor', 'isLicenseGuessed']) {
    check(a[prop], b[prop], prop)
  }
  const installPaths = uniq(a.installPaths.concat(b.installPaths))
  const dependencyPaths = uniq(a.dependencyPaths.concat(b.dependencyPaths))
  return { ...a, installPaths, dependencyPaths }
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
    const explicitLicense = _extractLicenseName(
      module.license || module.licence || module.licenses || module.licences)
    const guessedLicense = explicitLicense ? null : guessModuleLicense(module)
    const isLicenseGuessed = !!guessedLicense
    const licenseDescriptor = explicitLicense || guessedLicense

    yield {
      name: module.name,
      version: module.version,
      explicitName,
      licenseDescriptor,
      isLicenseGuessed,
      installPaths: [module.path],
      dependencyPaths: [parentPath],
    }
  }
  if (!module.dependencies) return

  const subpath = [...parentPath, explicitName]
  for (const depName of Object.keys(module.dependencies)) {
    yield* iterateModules(depName, module.dependencies[depName], subpath)
  }
}

export default (module) => {
  const moduleMap = {}
  const circulars = {}
  for (const _module of iterateModules('ROOT', module, [])) {
    const { explicitName, licenseDescriptor } = _module
    if (licenseDescriptor === '[Circular]') {
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
