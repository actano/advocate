/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import mergeWith from 'lodash/mergeWith';
import uniq from 'lodash/uniq';
const map = require('lodash/fp/map').convert({cap: false});

const guessModuleLicense = require('./guess-module-license')();

const _getExplicitModuleName = module => `${module.name}@${module.version}`;

const _mergeArray = function(a, b) {
    if (isArray(a)) {
        return uniq(a.concat(b));
    }
};

var _extractLicenseName = function(license) {
    switch (false) {
        case !isArray(license):
            return map(_extractLicenseName, license);
        case !isObject(license):
            return license.type != null ? license.type : license.name;
        default:
            return license;
    }
};

const _mapModule = function(module, parents) {
    let left, left1;
    let licenseDescriptor = _extractLicenseName((left = (left1 = module.license != null ? module.license : module.licence) != null ? left1 : module.licenses) != null ? left : module.licences);
    const installPaths = [module.path];
    let isLicenseGuessed = false;

    if (licenseDescriptor == null) {
        licenseDescriptor = guessModuleLicense(module);
        isLicenseGuessed = (licenseDescriptor != null);
    }

    return {
        name: module.name,
        explicitName: _getExplicitModuleName(module),
        version: module.version,
        licenseDescriptor,
        isLicenseGuessed,
        installPaths,
        dependencyPaths: [
            parents
        ]
    };
};

const _extractModule = function(module, parentPath) {
    if (parentPath == null) { parentPath = []; }
    const explicitName = _getExplicitModuleName(module);

    // Abort recursion if cycle found
    if (Array.from(parentPath).includes(explicitName)) {
        return {};
    }

    const depth = parentPath.length;

    const moduleMap = extractModules(module.dependencies, [...Array.from(parentPath), explicitName]);
    if ((depth !== 0) && !module.private) {
        moduleMap[explicitName] = _mapModule(module, parentPath);
    }

    return moduleMap;
};

var extractModules = function(modules, parentPath) {
    if (parentPath == null) { parentPath = []; }
    let moduleMap = {};

    for (let name in modules) {
        // Due to some strange behavior of `npm list`
        // dependencies, that are also installed on a higher level, are truncated in the json output.
        // They contain no version information and no name property.
        // These dependencies are included in the standard list output, however.
        // We can safely ignore these here, as they are listed on a higher level.
        const module = modules[name];
        if (module.name != null) {
            moduleMap = mergeWith(moduleMap, _extractModule(module, parentPath), _mergeArray);
        }
    }

    return moduleMap;
};

export default extractModules;
