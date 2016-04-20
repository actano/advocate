curry = require 'lodash/curry'
flow = require 'lodash/flow'
reject = require 'lodash/fp/reject'
map = require('lodash/fp/map').convert cap: false
forEach = require 'lodash/forEach'
omit = require 'lodash/omit'
property = require 'lodash/fp/property'
mapValues = require 'lodash/fp/mapValues'
groupBy = require 'lodash/fp/groupBy'
keyBy = require 'lodash/fp/keyBy'
isLicenseWhitelisted = require './is-license-whitelisted'
isModuleWhitelisted = require './is-module-whitelisted'
assign = require 'lodash/assign'

shallowCopy = -> assign {}, arguments...

_groupByNameByVersion = flow(
    groupBy 'name'
    mapValues keyBy 'version'
)

_addOtherUsedVersions = (moduleByNameByVersion) -> (module) ->
    {name, version} = module
    byVersion = omit moduleByNameByVersion[name], version
    return shallowCopy module,
        otherUsedVersions: byVersion

module.exports = curry (licenseWhitelist, exceptionWhitelist, moduleWhitelist, moduleMap) ->
    toModuleList = map (properties, explicitName) -> shallowCopy properties, {explicitName}

    isModuleLicenseWhitelisted = flow(
        property 'licenseDescriptor'
        isLicenseWhitelisted licenseWhitelist, exceptionWhitelist
    )

    moduleByNameByVersion = _groupByNameByVersion moduleMap

    getViolatingModules = flow(
        toModuleList
        reject isModuleLicenseWhitelisted
        reject isModuleWhitelisted moduleWhitelist
        map _addOtherUsedVersions moduleByNameByVersion
    )

    return getViolatingModules moduleMap
