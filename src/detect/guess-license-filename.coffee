flow = require 'lodash/flow'
pickBy = require 'lodash/fp/pickBy'
map = require 'lodash/fp/map'
some = require 'lodash/some'
keys = require 'lodash/keys'

licenseFileNameMatchingMap =
    'BSD': [
        /\bLicen[sc]e[.-]BSD\b/i
        /\bBSD[.-]Licen[sc]e\b/i
    ]
    'Apache-2.0': [
        /\bLicen[sc]e[.-]Apache2\b/i
        /\bApache2[.-]Licen[sc]e\b/i
    ]
    'MIT': [
        /\bMIT[.-]Licen[sc]e\b/i
        /\bLicen[sc]e[.-]MIT\b/i
    ]

module.exports = (filename) ->
    matchesFilename = (expression) -> expression.test filename

    someExpressionMatchesFilename = (regularExpressions) ->
        some regularExpressions, matchesFilename

    addSuffix = (license) ->
        "#{license}*"

    guessLicenses = flow(
        pickBy someExpressionMatchesFilename
        keys
        map addSuffix
    )

    return guessLicenses licenseFileNameMatchingMap
