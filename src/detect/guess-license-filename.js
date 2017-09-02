/* eslint-disable
    max-len,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import flow from 'lodash/flow'
import pickBy from 'lodash/fp/pickBy'
import map from 'lodash/fp/map'
import some from 'lodash/some'
import keys from 'lodash/keys'

const licenseFileNameMatchingMap = {
  BSD: [
    /\bLicen[sc]e[.-]BSD\b/i,
    /\bBSD[.-]Licen[sc]e\b/i,
  ],
  'Apache-2.0': [
    /\bLicen[sc]e[.-]Apache2\b/i,
    /\bApache2[.-]Licen[sc]e\b/i,
  ],
  MIT: [
    /\bMIT[.-]Licen[sc]e\b/i,
    /\bLicen[sc]e[.-]MIT\b/i,
  ],
}

export default function (filename) {
  const matchesFilename = expression => expression.test(filename)

  const someExpressionMatchesFilename = regularExpressions => some(regularExpressions, matchesFilename)

  const addSuffix = license => `${license}*`

  const guessLicenses = flow(
    pickBy(someExpressionMatchesFilename),
    keys,
    map(addSuffix),
  )

  return guessLicenses(licenseFileNameMatchingMap)
}
