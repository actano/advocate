import readDependencyTree from './read-dependency-tree'
import extractModules from './extract-module-map'

export default async (dev, path) => extractModules(await readDependencyTree(dev, path))
