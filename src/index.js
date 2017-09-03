import defaults from 'lodash/defaults'

import getViolatingModules from './check'
import { extractModules, readDependencyTree } from './detect'

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

  const dependencyTree = await readDependencyTree(dev, path)
  const allModules = extractModules({ root: dependencyTree })
  const violatingModules = getViolatingModules(licenses, licenseExceptions, modules, allModules)

  return {
    allModules,
    violatingModules,
  }
}
