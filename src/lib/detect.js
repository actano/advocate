import npm from './npm'
import { getLicenses, isYarnInUse } from './yarn'

export default async (dev, path) => {
  if (isYarnInUse(path)) {
    const modules = {}
    for (const module of await getLicenses(dev, path)) {
      modules[module.explicitName] = module
    }
    return modules
  }
  return npm(dev, path)
}
