import npm from './npm'
import { getLicenses, isYarnInUse } from './yarn'
import unique from './unique'

export default async (dev, path) =>
  unique(await (isYarnInUse(path) ? getLicenses(dev, path) : npm(dev, path)))
