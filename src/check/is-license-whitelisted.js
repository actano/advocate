/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import spdx from 'spdx';
import curry from 'lodash/curry';
import { createEvaluator } from '../spdx';

export default curry(function(licenseWhitelist, exceptionWhitelist, licenseDescription) {
    const inWhitelist = license => Array.from(licenseWhitelist).includes(license);

    const inExceptionWhitelist = exception => Array.from(exceptionWhitelist).includes(exception);

    if (Array.isArray(licenseDescription)) {
        return (licenseDescription.length > 0) && licenseDescription.some(inWhitelist);
    }

    if ((licenseDescription != null) && spdx.valid(licenseDescription)) {
        const spdxAst = spdx.parse(licenseDescription);
        const evaluate = createEvaluator(inWhitelist, inExceptionWhitelist);
        return evaluate(spdxAst);
    }

    return inWhitelist(licenseDescription);
});

