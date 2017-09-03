import isObject from 'lodash/isObject'
import mergeWith from 'lodash/mergeWith'
import uniq from 'lodash/uniq'

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

const _extractModule = (module, parentPath = []) => {
  const explicitName = _getExplicitModuleName(module)

  // Abort recursion if cycle found
  if (parentPath.includes(explicitName)) {
    return {}
  }

  const depth = parentPath.length

  const moduleMap = extractModules(module.dependencies, [...parentPath, explicitName])
  if (depth && !module.private) {
    moduleMap[explicitName] = _mapModule(module, parentPath)
  }

  return moduleMap
}

const extractModules = (modules = {}, parentPath = []) => {
  let moduleMap = {}

  for (const name of Object.keys(modules)) {
    // Due to some strange behavior of `npm list`
    // dependencies, that are also installed on a higher level, are truncated in the json output.
    // They contain no version information and no name property.
    // These dependencies are included in the standard list output, however.
    // We can safely ignore these here, as they are listed on a higher level.
    const module = modules[name]
    if (module.name != null) {
      moduleMap = mergeWith(moduleMap, _extractModule(module, parentPath), _mergeArray)
    }
  }

  return moduleMap
}

export default extractModules
