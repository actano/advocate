import path from 'path'
import flow from 'lodash/flow'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import flatten from 'lodash/fp/flatten'
import uniq from 'lodash/uniq'
import fs from 'fs'

import guessLicenseText from './guess-license-text'
import guessLicenseFilename from './guess-license-filename'

const licenseRegExp = /\b((LICEN[SC]E)|(README))\b/i
const isLicenseFilename = licenseRegExp.test.bind(licenseRegExp)

export default (module) => {
  const guessFile = (file) => {
    const filename = path.join(module.path, file)
    const text = fs.readFileSync(filename, 'utf8')
    return guessLicenseText(text).concat(guessLicenseFilename(file))
  }

  const guessFiles = flow(
    filter(isLicenseFilename),
    map(guessFile),
    flatten,
  )

  const guessedLicenses = []

  if (module.files != null) {
    guessedLicenses.push(...guessFiles(module.files))
  }

  if ((module.path != null) && fs.existsSync(module.path)) {
    const files = fs.readdirSync(module.path)
    guessedLicenses.push(...guessFiles(files))
  }

  if (module.readme != null) {
    guessedLicenses.push(...guessLicenseText(module.readme))
  }

  if (guessedLicenses.length > 0) { return uniq(guessedLicenses) }
  return null
}
