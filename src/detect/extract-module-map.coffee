isArray = require 'lodash/isArray'
isObject  = require 'lodash/isObject'
mergeWith = require 'lodash/mergeWith'
uniq = require 'lodash/uniq'
map = require('lodash/fp/map').convert cap: false

guessModuleLicense = require('./guess-module-license')()

_getExplicitModuleName = (module) ->
    "#{module.name}@#{module.version}"

_mergeArray = (a, b) ->
    if isArray a
        return uniq a.concat b

_extractLicenseName = (license) ->
    return switch
        when isArray license
            map _extractLicenseName, license
        when isObject license
            license.type ? license.name
        else
            license

_mapModule = (module, parents) ->
    licenseDescriptor = _extractLicenseName module.license ? module.licence ? module.licenses ? module.licences
    installPaths = [module.path]
    isLicenseGuessed = false

    unless licenseDescriptor?
        licenseDescriptor = guessModuleLicense module
        isLicenseGuessed = licenseDescriptor?

    return {
        name: module.name
        version: module.version
        licenseDescriptor
        isLicenseGuessed
        installPaths
        dependencyPaths: [
            parents
        ]
    }

_extractModule = (module, parentPath = []) ->
    explicitName = _getExplicitModuleName module

    # Abort recursion if cycle found
    if explicitName in parentPath
        return {}

    depth = parentPath.length

    moduleMap = extractModules module.dependencies, [parentPath..., explicitName]
    unless depth is 0 or module.private
        moduleMap[explicitName] = _mapModule module, parentPath

    return moduleMap

extractModules = (modules, parentPath = []) ->
    moduleMap = {}

    for name, module of modules
        # Due to some strange behavior of `npm list`
        # dependencies, that are also installed on a higher level, are truncated in the json output.
        # They contain no version information and no name property.
        # These dependencies are included in the standard list output, however.
        # We can safely ignore these here, as they are listed on a higher level.
        if module.name?
            moduleMap = mergeWith moduleMap, _extractModule(module, parentPath), _mergeArray

    return moduleMap

module.exports = extractModules
