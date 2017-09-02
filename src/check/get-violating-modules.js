/* eslint-disable
    func-names,
    import/first,
    no-unused-vars,
    prefer-rest-params,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import curry from 'lodash/curry'
import flow from 'lodash/flow'
import reject from 'lodash/fp/reject'

const map = require('lodash/fp/map').convert({ cap: false })

import forEach from 'lodash/forEach'
import omit from 'lodash/omit'
import omitBy from 'lodash/fp/omitBy'
import property from 'lodash/fp/property'

const mapValues = require('lodash/fp/mapValues').convert({ cap: false })

import groupBy from 'lodash/fp/groupBy'
import keyBy from 'lodash/fp/keyBy'
import isLicenseWhitelisted from './is-license-whitelisted'
import isModuleWhitelisted from './is-module-whitelisted'
import assign from 'lodash/assign'

const shallowCopy = function () { return assign({}, ...arguments) }

const _groupByNameByVersion = flow(
  groupBy('name'),
  mapValues(keyBy('version')),
)

const _addOtherUsedVersions = curry((moduleByNameByVersion, module) => {
  const { name, version } = module
  const byVersion = omit(moduleByNameByVersion[name], version)
  return shallowCopy(module,
    { otherUsedVersions: byVersion })
})

export default curry((licenseWhitelist, exceptionWhitelist, moduleWhitelist, moduleMap) => {
  const isModuleLicenseWhitelisted = flow(
    property('licenseDescriptor'),
    isLicenseWhitelisted(licenseWhitelist, exceptionWhitelist),
  )

  const moduleByNameByVersion = _groupByNameByVersion(moduleMap)

  const getViolatingModules = flow(
    omitBy(isModuleLicenseWhitelisted),
    omitBy(isModuleWhitelisted(moduleWhitelist)),
    mapValues(_addOtherUsedVersions(moduleByNameByVersion)),
  )

  return getViolatingModules(moduleMap)
})
