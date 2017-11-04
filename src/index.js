import defaults from 'lodash/defaults'

import getViolatingModules from './check'
import detect from './detect'

export default async function (whitelist, options) {
  const { dev, path } = defaults(options, {
    dev: false,
    path: null,
  })

  const { licenses, licenseExceptions, modules } = defaults(whitelist, {
    licenses: [],
    licenseExceptions: [],
    modules: [],
  })

  const allModules = await detect(dev, path)
  const violatingModules = getViolatingModules(licenses, licenseExceptions, modules, allModules)

  return {
    allModules,
    violatingModules,
  }
}
