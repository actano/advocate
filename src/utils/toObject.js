/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import curry from 'lodash/curry';
import flow from 'lodash/flow';
import mapValues from 'lodash/fp/mapValues';
import keyBy from 'lodash/fp/keyBy';
import identity from 'lodash/identity';

export default curry((value, attributes) =>
    flow(
        keyBy(identity),
        mapValues(() => value)
    )(attributes)
);
