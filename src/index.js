Promise = require 'bluebird'

{getViolatingModules} = require './check'
{readDependencyTree, extractModules} = require './detect'
defaults = require 'lodash/defaults'

module.exports = Promise.coroutine (whitelist, options) ->
    options = defaults options,
        dev: false
        path: null

    whitelist = defaults whitelist,
        licenses: []
        licenseExceptions: []
        modules: []

    dependencyTree = yield readDependencyTree options.dev, options.path
    allModules = extractModules root: dependencyTree
    violatingModules = getViolatingModules whitelist.licenses, whitelist.licenseExceptions, whitelist.modules, allModules

    return {
        allModules
        violatingModules
    }
