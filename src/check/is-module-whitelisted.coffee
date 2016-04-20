curry = require 'lodash/curry'
pick = require 'lodash/pick'
some = require 'lodash/some'
sortBy = require 'lodash/sortBy'
isEqual = require 'lodash/fp/isEqual'
isMatchWith = require 'lodash/fp/isMatchWith'

_matchLicenses = (whitelist, actual, key) ->
    if key is 'licenseDescriptor'
        whitelist = sortBy [].concat whitelist
        actual = sortBy [].concat actual

        return isEqual whitelist, actual
    else
        return

module.exports = curry (moduleWhitelist, module) ->
    moduleProps =
        name: module.name
        version: module.version
        licenseDescriptor: module.licenseDescriptor

    matchesModule = isMatchWith _matchLicenses, moduleProps

    return some moduleWhitelist, matchesModule
