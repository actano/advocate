import isObject from 'lodash/isObject'
import mergeWith from 'lodash/mergeWith'
import uniq from 'lodash/uniq'
import values from 'lodash/values'

import guessModuleLicense from './guess-module-license'

const _getExplicitModuleName = module => `${module.name}@${module.version}`

const _mergeArray = (a, b) => (Array.isArray(a) ? uniq(a.concat(b)) : undefined)

const _extractLicenseName = (license) => {
  if (Array.isArray(license)) return license.map(_extractLicenseName)
  if (isObject(license)) return license.type || license.name
  return license
}

const _mapModule = (module, parents) => {
  const explicitLicense = _extractLicenseName(
    module.license || module.licence || module.licenses || module.licences)
  const guessedLicense = explicitLicense ? null : guessModuleLicense(module)
  const isLicenseGuessed = !!guessedLicense
  const licenseDescriptor = explicitLicense || guessedLicense

  return {
    name: module.name,
    explicitName: _getExplicitModuleName(module),
    version: module.version,
    licenseDescriptor,
    isLicenseGuessed,
    installPaths: [module.path],
    dependencyPaths: [parents],
  }
}

function* iterateModules(module, parentPath) {
  const main = _mapModule(module, parentPath)
  const { explicitName } = main
  // Abort recursion if cycle found
  if (parentPath.includes(explicitName)) return
  if (parentPath.length && !module.private) yield main
  if (!module.dependencies) return

  const subpath = [...parentPath, explicitName]
  for (const dep of values(module.dependencies)) {
    yield* iterateModules(dep, subpath)
  }
}

export default (module) => {
  const moduleMap = {}
  for (const _module of iterateModules(module, [])) {
    const { explicitName } = _module
    if (moduleMap[explicitName]) {
      moduleMap[explicitName] = mergeWith(moduleMap[explicitName], _module, _mergeArray)
    } else {
      moduleMap[explicitName] = _module
    }
  }
  return moduleMap
}
