curry = require 'lodash/curry'
flow = require 'lodash/flow'
mapValues = require 'lodash/fp/mapValues'
keyBy = require 'lodash/fp/keyBy'
identity = require 'lodash/identity'

module.exports = curry (value, attributes) ->
    flow(
        keyBy identity
        mapValues -> value
    ) attributes
