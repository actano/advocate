/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import sinon from 'sinon';
import { expect } from 'chai';
import memo from 'memo-is';

describe('module whitelist check', function() {

    const moduleWhitelist = memo().is(() => []);
    let isModuleWhitelisted = null;

    beforeEach(() => isModuleWhitelisted = require('../../src/check/is-module-whitelisted')(moduleWhitelist()));

    describe('whitelist contains matching module', function() {

        moduleWhitelist.is(() => [{
            name: 'module1',
            version: '1',
            licenseDescriptor: 'BSD'
        }
        , {
            name: 'module2',
            version: '3',
            licenseDescriptor: 'MIT'
        }
        ] );

        return it('returns true', function() {
            const module = {
                name: 'module2',
                version: '3',
                licenseDescriptor: 'MIT'
            };

            return expect(isModuleWhitelisted(module)).to.be.true;
        });
    });

    describe('given module has a mismatching property', function() {

        moduleWhitelist.is(() => [{
            name: 'module1',
            version: '1',
            licenseDescriptor: 'BSD'
        }
        ] );

        it('returns false on mismatching license', function() {
            const module = {
                name: 'module1',
                version: '1',
                licenseDescriptor: 'MIT'
            };

            return expect(isModuleWhitelisted(module)).to.be.false;
        });

        it('returns false on mismatching version', function() {
            const module = {
                name: 'module1',
                version: '2',
                licenseDescriptor: 'BSD'
            };

            return expect(isModuleWhitelisted(module)).to.be.false;
        });

        return it('returns false on mismatching module name', function() {
            const module = {
                name: 'module2',
                version: '1',
                licenseDescriptor: 'BSD'
            };

            return expect(isModuleWhitelisted(module)).to.be.false;
        });
    });

    describe('given module has a missing property', function() {

        moduleWhitelist.is(() => [{
            name: 'module1',
            version: '1',
            licenseDescriptor: 'BSD'
        }
        ] );

        it('returns false on missing license', function() {
            const module = {
                name: 'module1',
                version: '1'
            };

            return expect(isModuleWhitelisted(module)).to.be.false;
        });

        it('returns false on missing version', function() {
            const module = {
                name: 'module1',
                licenseDescriptor: 'BSD'
            };

            return expect(isModuleWhitelisted(module)).to.be.false;
        });

        return it('returns false on missing name', function() {
            const module = {
                version: '1',
                licenseDescriptor: 'BSD'
            };

            return expect(isModuleWhitelisted(module)).to.be.false;
        });
    });

    return describe('license property', function() {

        describe('simple string in whitelisted license', function() {

            moduleWhitelist.is(() => [{
                name: 'module1',
                version: '1',
                licenseDescriptor: 'BSD'
            }
            ] );

            it('returns true for array with single matching license', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: ['BSD']
                };

                return expect(isModuleWhitelisted(module)).to.be.true;
            });

            return it('returns false for array with multiple licenses', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: ['BSD', 'MIT']
                };

                return expect(isModuleWhitelisted(module)).to.be.false;
            });
        });

        describe('null in whitelisted license', function() {

            moduleWhitelist.is(() => [{
                name: 'module1',
                version: '1',
                licenseDescriptor: null
            }
            ] );

            it('returns true for matching license', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: null
                };

                return expect(isModuleWhitelisted(module)).to.be.true;
            });

            return it('returns false for not matching license', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: 'BSD'
                };

                return expect(isModuleWhitelisted(module)).to.be.false;
            });
        });

        describe('single element array in whitelisted license', function() {

            moduleWhitelist.is(() => [{
                name: 'module1',
                version: '1',
                licenseDescriptor: ['BSD']
            }
            ] );

            it('returns true for matching array', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: ['BSD']
                };

                return expect(isModuleWhitelisted(module)).to.be.true;
            });

            return it('returns true for single matchting value', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: 'BSD'
                };

                return expect(isModuleWhitelisted(module)).to.be.true;
            });
        });

        return describe('multiple element array in whitelisted license', function() {

            moduleWhitelist.is(() => [{
                name: 'module1',
                version: '1',
                licenseDescriptor: ['JSON', 'BSD']
            }
            ] );

            it('returns true for matching array with different order', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: ['BSD', 'JSON']
                };

                return expect(isModuleWhitelisted(module)).to.be.true;
            });

            return it('returns false for different array', function() {
                const module = {
                    name: 'module1',
                    version: '1',
                    licenseDescriptor: ['BSD', 'MIT']
                };

                return expect(isModuleWhitelisted(module)).to.be.false;
            });
        });
    });
});
