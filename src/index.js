import detect from './lib/detect'
import getViolating from './lib/violating'

export const getLicenses = async (dev = false, path) => detect(dev, path)

export default async function (whitelist = {}, { dev = false, path } = {}) {
  const allModules = await getLicenses(dev, path)
  const violatingModules = getViolating(whitelist, allModules)

  return { allModules, violatingModules }
}
