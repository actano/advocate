import isLicenseWhitelisted from './license-whitelisted'
import isModuleWhitelisted from './module-whitelisted'
import isAuthorWhitelisted from './author-whitelisted'

export default ({
  modules = [], licenses, authors = [], licenseExceptions,
}, {
  name, version, license, author,
}) =>
  isLicenseWhitelisted(licenses, licenseExceptions, license)
  || isAuthorWhitelisted(authors, author)
  || isModuleWhitelisted(modules, { name, version })
