/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import curry from 'lodash/curry';
import pick from 'lodash/fp/pick';
import defaults from 'lodash/fp/defaults';
import flow from 'lodash/flow';

import toObject from './toObject';

export default curry((attributes, defaultValue, object) =>
    flow(
        pick(attributes),
        defaults(toObject(defaultValue, attributes))
    )(object)
);
