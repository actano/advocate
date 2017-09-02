spdx = require 'spdx'
curry = require 'lodash/curry'
{createEvaluator} = require '../spdx'

module.exports = curry (licenseWhitelist, exceptionWhitelist, licenseDescription) ->
    inWhitelist = (license) ->
        license in licenseWhitelist

    inExceptionWhitelist = (exception) ->
        exception in exceptionWhitelist

    if Array.isArray licenseDescription
        return licenseDescription.length > 0 and licenseDescription.some(inWhitelist)

    if licenseDescription? and spdx.valid(licenseDescription)
        spdxAst = spdx.parse licenseDescription
        evaluate = createEvaluator inWhitelist, inExceptionWhitelist
        return evaluate spdxAst

    return inWhitelist licenseDescription

