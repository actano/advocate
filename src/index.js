/* eslint-disable
    import/first,
    max-len,
    no-param-reassign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import Promise from 'bluebird'

import { getViolatingModules } from './check'
import { readDependencyTree, extractModules } from './detect'
import defaults from 'lodash/defaults'

export default async function (whitelist, options) {
  options = defaults(options, {
    dev: false,
    path: null,
  },
  )

  whitelist = defaults(whitelist, {
    licenses: [],
    licenseExceptions: [],
    modules: [],
  })

  const dependencyTree = await readDependencyTree(options.dev, options.path)
  const allModules = extractModules({ root: dependencyTree })
  const violatingModules = getViolatingModules(whitelist.licenses, whitelist.licenseExceptions, whitelist.modules, allModules)

  return {
    allModules,
    violatingModules,
  }
}
