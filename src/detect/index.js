import readDependencyTree from './read-dependency-tree'
import extractModules from './extract-module-map'
import { getLicenses, isYarnInUse } from './yarn'

export default async (dev, path) => {
  if (isYarnInUse(path)) {
    const modules = {}
    for (const { name, version, license } of await getLicenses(dev, path)) {
      modules[name] = {
        name,
        version,
        license,
        explicitName: `${name}@${version}`,
      }
    }
    return modules
  }
  return extractModules(await readDependencyTree(dev, path))
}
