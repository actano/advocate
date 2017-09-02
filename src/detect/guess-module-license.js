/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import path from 'path';
import flow from 'lodash/flow';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import uniq from 'lodash/uniq';

import guessLicenseText from './guess-license-text';
import guessLicenseFilename from './guess-license-filename';

const licenseRegExp = /\b((LICEN[SC]E)|(README))\b/i;
const isLicenseFilename = licenseRegExp.test.bind(licenseRegExp);

export default function(fs) { if (fs == null) { fs = require('fs'); } return function(module) {
    const guessFile = function(file) {
        const filename = path.join(module.path, file);
        const text = fs.readFileSync(filename, 'utf8');
        return guessLicenseText(text).concat(guessLicenseFilename(file));
    };

    const guessFiles = flow(
        filter(isLicenseFilename),
        map(guessFile),
        flatten
    );

    let guessedLicenses = [];

    if (module.files != null) {
        guessedLicenses = guessedLicenses.concat(guessFiles(module.files));
    }

    if ((module.path != null) && fs.existsSync(module.path)) {
        const files = fs.readdirSync(module.path);
        guessedLicenses = guessedLicenses.concat(guessFiles(files));
    }

    if (module.readme != null) {
        guessedLicenses = guessedLicenses.concat(guessLicenseText(module.readme));
    }

    guessedLicenses = uniq(guessedLicenses);

    if (guessedLicenses.length > 0) { return guessedLicenses; }
    return null;
}; };
