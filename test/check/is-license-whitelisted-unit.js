/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import sinon from 'sinon';
import { expect } from 'chai';
import memo from 'memo-is';

describe('license whitelist check', function() {

    const licenseWhitelist = memo().is(() => []);
    const exceptionWhitelist = memo().is(() => []);
    let isLicenseWhitelisted = null;

    beforeEach(() => isLicenseWhitelisted = require('../../src/check/is-license-whitelisted')(licenseWhitelist(), exceptionWhitelist()));

    describe('simple license name', function() {

        context('well known license', function() {

            licenseWhitelist.is(() => ['MIT']);

            it('should return true if name is whitelisted', () => expect(isLicenseWhitelisted('MIT')).to.be.true);

            return it('should return false if name isn\'t whitelisted', () => expect(isLicenseWhitelisted('JSON')).to.be.false);
        });

        return context('random license name', function() {

            licenseWhitelist.is(() => ['FOO']);

            it('should return true if name is whitelisted', () => expect(isLicenseWhitelisted('FOO')).to.be.true);

            it('should return false if name isn\'t whitelisted', () => expect(isLicenseWhitelisted('BAR')).to.be.false);

            it('should return true if name is empty', () => expect(isLicenseWhitelisted('')).to.be.false);

            return context('non alpha numeric license name', function() {
                licenseWhitelist.is(() => ['($?!']);

                return it('should return true if non alphanumeric name is whitelisted', () => expect(isLicenseWhitelisted('($?!')).to.be.true);
            });
        });
    });

    describe('array of simple license names', function() {

        licenseWhitelist.is(() => ['FOO']);

        it('should return true if at least one name is whitelisted', () => expect(isLicenseWhitelisted(['BAR', 'FOO'])).to.be.true);

        it('should return false if no name is whitelisted', () => expect(isLicenseWhitelisted(['BAR', 'BAZ'])).to.be.false);

        return it('should return false if the array is empty', () => expect(isLicenseWhitelisted([])).to.be.false);
    });

    return describe('SPDX license expression', function() {

        licenseWhitelist.is(() => ['MIT', 'JSON']);

        it('should return true if SPDX expression evaluates to true', () => expect(isLicenseWhitelisted('(MIT+ AND (JSON OR AML))')).to.be.true);

        it('should return false if SPDX expression evaluates to false', () => expect(isLicenseWhitelisted('(MIT+ AND (JSON AND AML))')).to.be.false);

        return describe('with exceptions', function() {

            licenseWhitelist.is(() => ['MIT']);
            exceptionWhitelist.is(() => ['LZMA-exception']);

            it('should return true if expression is using a whitelisted exception', () => expect(isLicenseWhitelisted('MIT WITH LZMA-exception')).to.be.true);

            return it('should return false if expression isn\'t using a whitelisted exception', () => expect(isLicenseWhitelisted('MIT WITH Libtool-exception')).to.be.false);
        });
    });
});
