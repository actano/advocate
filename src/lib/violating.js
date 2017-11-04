import isWhitelisted from './whitelisted'

export default (whitelist, allModules) => {
  const violating = Object.values(allModules).filter(module => !isWhitelisted(whitelist, module))
  const result = {}
  for (const module of violating) {
    result[module.explicitName] = module
  }
  return result
}
