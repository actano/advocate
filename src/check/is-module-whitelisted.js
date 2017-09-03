import curry from 'lodash/curry'
import some from 'lodash/some'
import sortBy from 'lodash/sortBy'
import isEqual from 'lodash/fp/isEqual'
import isMatchWith from 'lodash/fp/isMatchWith'

function _matchLicenses(whitelistedValue, actualValue, propertyName) {
  if (propertyName === 'licenseDescriptor') {
    const whitelistedLicensesAsArray = sortBy([].concat(whitelistedValue))
    const actualLicensesAsArray = sortBy([].concat(actualValue))

    return isEqual(whitelistedLicensesAsArray, actualLicensesAsArray)
  }
  return undefined
}

export default curry((moduleWhitelist, module) => {
  const moduleProps = {
    name: module.name || null,
    version: module.version || null,
    licenseDescriptor: module.licenseDescriptor || null,
  }
  const matchesModule = isMatchWith(_matchLicenses, moduleProps)

  return some(moduleWhitelist, matchesModule)
})
