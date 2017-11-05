import isWhitelisted from './whitelisted'

export default (whitelist, allModules) =>
  allModules.filter(module => !isWhitelisted(whitelist, module))
