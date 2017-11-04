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
        licenseDescriptor: license,
        explicitName: `${name}@${version}`,
        isLicenseGuessed: false,
      }
      module.licenseDescriptor = module.license
    }
    return modules
  }
  return extractModules(await readDependencyTree(dev, path))
}
