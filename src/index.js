import Promise from 'bluebird';

import { getViolatingModules } from './check';
import { readDependencyTree, extractModules } from './detect';
import defaults from 'lodash/defaults';

export default Promise.coroutine(function*(whitelist, options) {
    options = defaults(options, {
        dev: false,
        path: null
    }
    );

    whitelist = defaults(whitelist, {
        licenses: [],
        licenseExceptions: [],
        modules: []
    });

    const dependencyTree = yield readDependencyTree(options.dev, options.path);
    const allModules = extractModules({root: dependencyTree});
    const violatingModules = getViolatingModules(whitelist.licenses, whitelist.licenseExceptions, whitelist.modules, allModules);

    return {
        allModules,
        violatingModules
    };});
