Promise = require 'bluebird'

{getViolatingModules} = require './check'
{readDependencyTree, extractModules} = require './detect'

module.exports = Promise.coroutine (whitelist, options) ->
    development = options.dev ? false
    path = options.path ? null

    dependencyTree = yield readDependencyTree development, path
    allModules = extractModules root: dependencyTree
    violatingModules = getViolatingModules whitelist.licenses, whitelist.licenseExceptions, whitelist.modules, allModules

    return {
        allModules
        violatingModules
    }
