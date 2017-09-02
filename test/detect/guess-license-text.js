/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { expect } from 'chai';

describe('guess licenses from licence/readme text', function() {

    let guessLicenseText = null;

    before('require', () => guessLicenseText = require('../../src/detect/guess-license-text'));

    it('guess no license', function() {
        const text = '... MIT ...';
        return expect(guessLicenseText(text)).to.deep.equal([]);
});

    it('guess single license', function() {
        const text = '... MIT License ...';
        return expect(guessLicenseText(text)).to.deep.equal(['MIT*']);
});

    return it('guess multiple licenses', function() {
        const text = '... MIT License ... BSD License ... Apache License Version 2.0 ...';
        return expect(guessLicenseText(text)).to.have.members(['MIT*', 'BSD*', 'Apache-2.0*']);
});
});
