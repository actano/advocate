path = require 'path'
flow = require 'lodash/flow'
filter = require 'lodash/fp/filter'
map = require 'lodash/fp/map'
flatten = require 'lodash/fp/flatten'
uniq = require 'lodash/uniq'

guessLicenseText = require './guess-license-text'
guessLicenseFilename = require './guess-license-filename'

licenseRegExp = /\b((LICEN[SC]E)|(README))\b/i
isLicenseFilename = licenseRegExp.test.bind licenseRegExp

module.exports = (fs = require('fs')) -> (module) ->
    guessFile = (file) ->
        filename = path.join module.path, file
        text = fs.readFileSync filename, 'utf8'
        guessLicenseText(text).concat guessLicenseFilename file

    guessFiles = flow(
        filter isLicenseFilename
        map guessFile
        flatten
    )

    guessedLicenses = []

    if module.files?
        guessedLicenses = guessedLicenses.concat guessFiles module.files

    if module.path? and fs.existsSync module.path
        files = fs.readdirSync module.path
        guessedLicenses = guessedLicenses.concat guessFiles files

    if module.readme?
        guessedLicenses = guessedLicenses.concat guessLicenseText module.readme

    guessedLicenses = uniq guessedLicenses

    return guessedLicenses if guessedLicenses.length > 0
    return null
