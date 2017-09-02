import curry from 'lodash/curry';
import some from 'lodash/some';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/fp/isEqual';
import isMatchWith from 'lodash/fp/isMatchWith';

import pickWithDefault from '../utils/pickWithDefault';

const _matchLicenses = function(whitelistedValue, actualValue, propertyName) {
    if (propertyName === 'licenseDescriptor') {
        const whitelistedLicensesAsArray = sortBy([].concat(whitelistedValue));
        const actualLicensesAsArray = sortBy([].concat(actualValue));

        return isEqual(whitelistedLicensesAsArray, actualLicensesAsArray);
    }
};

export default curry(function(moduleWhitelist, module) {
    const moduleProps = pickWithDefault(['name', 'version', 'licenseDescriptor'], null, module);
    const matchesModule = isMatchWith(_matchLicenses, moduleProps);

    return some(moduleWhitelist, matchesModule);
});
