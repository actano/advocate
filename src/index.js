import getViolatingModules from './check'
import detect from './detect'

export default async function (
  { licenses = [], licenseExceptions = [], modules = [] } = {},
  { dev = false, path } = {}) {
  const allModules = await detect(dev, path)
  const violatingModules = getViolatingModules(licenses, licenseExceptions, modules, allModules)

  return {
    allModules,
    violatingModules,
  }
}
