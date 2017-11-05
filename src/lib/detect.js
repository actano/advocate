import npm from './npm'
import { getLicenses, isYarnInUse } from './yarn'

export default async (dev, path) => (isYarnInUse(path) ? getLicenses(dev, path) : npm(dev, path))
