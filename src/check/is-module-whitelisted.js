curry = require 'lodash/curry'
some = require 'lodash/some'
sortBy = require 'lodash/sortBy'
isEqual = require 'lodash/fp/isEqual'
isMatchWith = require 'lodash/fp/isMatchWith'

pickWithDefault = require '../utils/pickWithDefault'

_matchLicenses = (whitelistedValue, actualValue, propertyName) ->
    if propertyName is 'licenseDescriptor'
        whitelistedLicensesAsArray = sortBy [].concat whitelistedValue
        actualLicensesAsArray = sortBy [].concat actualValue

        return isEqual whitelistedLicensesAsArray, actualLicensesAsArray

module.exports = curry (moduleWhitelist, module) ->
    moduleProps = pickWithDefault ['name', 'version', 'licenseDescriptor'], null, module
    matchesModule = isMatchWith _matchLicenses, moduleProps

    return some moduleWhitelist, matchesModule
