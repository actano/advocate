import isLicenseWhitelisted from './license-whitelisted'
import isModuleWhitelisted from './module-whitelisted'

export default ({ modules = [], licenses, licenseExceptions }, { name, version, license }) =>
  isLicenseWhitelisted(licenses, licenseExceptions, license)
  || isModuleWhitelisted(modules, { name, version })
