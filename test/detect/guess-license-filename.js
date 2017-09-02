/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { expect } from 'chai';

describe('guess licenses from license file name', function() {

    let guessLicenseFilename = null;

    before('require', () => guessLicenseFilename = require('../../src/detect/guess-license-filename'));

    it('guess no license', function() {
        const filename = 'ReadMe.txt';
        return expect(guessLicenseFilename(filename)).to.deep.equal([]);
});

    return it('guess license', function() {
        const filename = 'LICENSE-MIT';
        return expect(guessLicenseFilename(filename)).to.deep.equal(['MIT*']);
});
});
