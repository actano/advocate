curry = require 'lodash/curry'
some = require 'lodash/some'
sortBy = require 'lodash/sortBy'
isEqual = require 'lodash/fp/isEqual'
isMatchWith = require 'lodash/fp/isMatchWith'

pickWithDefault = require '../utils/pickWithDefault'

_matchLicenses = (whitelist, actual, key) ->
    if key is 'licenseDescriptor'
        whitelist = sortBy [].concat whitelist
        actual = sortBy [].concat actual

        return isEqual whitelist, actual
    else
        return

module.exports = curry (moduleWhitelist, module) ->
    moduleProps = pickWithDefault ['name', 'version', 'licenseDescriptor'], null, module

    matchesModule = isMatchWith _matchLicenses, moduleProps

    return some moduleWhitelist, matchesModule
