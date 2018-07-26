import execFile from './exec-file'

export const CIRCULAR = '[Circular]'

const _extractLicenseName = (license) => {
  if (!license) return null
  if (Array.isArray(license)) return license.map(_extractLicenseName)
  if (license.type || license.name) return _extractLicenseName(license.type || license.name)
  return license
}

function* iterateDependencies(parent) {
  if (!parent.dependencies) return

  for (const module of Object.values(parent.dependencies)) {
    const { name, version, author } = module
    if (!module.private) {
      const license = _extractLicenseName(module.license || module.licence || module.licenses || module.licences)

      yield {
        name,
        version: String(version),
        license,
        author,
      }
    }
    yield* iterateDependencies(module)
  }
}

export const extractModules = (module) => {
  const moduleMap = []
  const circulars = {}
  for (const _module of iterateDependencies(module)) {
    const { name, version, license } = _module
    const explicitName = `${name}@${version}`
    if (license !== CIRCULAR) {
      moduleMap.push(_module)
      circulars[explicitName] = false
    } else if (circulars[explicitName] === undefined) {
      circulars[explicitName] = true
    }
  }
  for (const circular of Object.keys(circulars)) {
    if (circulars[circular]) {
      throw new Error(`${circular} has only circular references, cannot determine license`)
    }
  }
  return moduleMap
}

export const readDependencyTree = async function (dev, cwd) {
  return JSON.parse(await execFile(cwd, 'npm', 'list', '--json', '--long', dev ? '--dev' : '--prod'))
}

export default async (dev, path) => extractModules(await readDependencyTree(dev, path))
