import curry from 'lodash/curry'
import flow from 'lodash/flow'
import groupBy from 'lodash/fp/groupBy'
import keyBy from 'lodash/fp/keyBy'
import _mapValues from 'lodash/fp/mapValues'
import omitBy from 'lodash/omitBy'
import property from 'lodash/fp/property'
import omit from 'lodash/omit'

import isLicenseWhitelisted from './is-license-whitelisted'
import _isModuleWhitelisted from './is-module-whitelisted'

const mapValues = _mapValues.convert({ cap: false })

const _groupByNameByVersion = flow(
  groupBy('name'),
  mapValues(keyBy('version')),
)

const _addOtherUsedVersions = curry((moduleByNameByVersion, module) => {
  const { name, version } = module
  const byVersion = omit(moduleByNameByVersion[name], version)
  return { ...module, otherUsedVersions: byVersion }
})

export default curry((licenseWhitelist, exceptionWhitelist, moduleWhitelist, moduleMap) => {
  const isModuleWhitelisted = _isModuleWhitelisted(moduleWhitelist)
  const isModuleLicenseWhitelisted = flow(
    property('license'),
    isLicenseWhitelisted(licenseWhitelist, exceptionWhitelist),
  )

  const moduleByNameByVersion = _groupByNameByVersion(moduleMap)

  const withoutWithelistedLicenses = omitBy(moduleMap, isModuleLicenseWhitelisted)
  const withoutWithelistedModules = omitBy(withoutWithelistedLicenses, isModuleWhitelisted)
  return mapValues(_addOtherUsedVersions(moduleByNameByVersion), withoutWithelistedModules)
})
