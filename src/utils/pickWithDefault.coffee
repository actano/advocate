curry = require 'lodash/curry'
pick = require 'lodash/fp/pick'
defaults = require 'lodash/fp/defaults'
flow = require 'lodash/flow'

toObject = require './toObject'

module.exports = curry (attributes, defaultValue, object) ->
    flow(
        pick attributes
        defaults toObject(defaultValue, attributes)
    ) object
