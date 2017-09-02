/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {expect} = require('chai')
    .use(require('chai-subset'));
import sinon from 'sinon';
import memo from 'memo-is';
import Promise from 'bluebird';
import path from 'path';
import map from 'lodash/fp/map';

import advocate from '../src/index';
const testDataPathA = path.join(__dirname, 'integration-data/a');
const testDataPathB = path.join(__dirname, 'integration-data/b');

describe('advocate integration test', function() {

    describe('with missing parameters', function() {

        context('with no given parameters', () =>
            it('returns without error', Promise.coroutine(function*() {
                const options = {path: testDataPathA};
                const {allModules, violatingModules} = yield advocate();

                expect(violatingModules).to.be.an('object');
                return expect(allModules).to.be.an('object');
            })
            )
        );

        context('with no given whitelist', () =>
            it('returns all production dependencies for given path', Promise.coroutine(function*() {
                const options = {path: testDataPathA};
                const {allModules, violatingModules} = yield advocate(null, {path: testDataPathA});

                return expect(map('explicitName', violatingModules)).to.have.members([
                    'b@0.0.1',
                    'c@0.0.1'
                ]);}))
    );

        return context('with no given license whitelist', () =>
            it('returns all violating dependencies for given path', Promise.coroutine(function*() {
                const options = {path: testDataPathA};
                const whitelist = {
                    modules: [{
                        name: 'c',
                        version: '0.0.1',
                        licenseDescriptor: 'Apache-2.0 WITH LZMA-exception'
                    }
                    ]
                };

                const {allModules, violatingModules} = yield advocate(whitelist, {path: testDataPathA});

                return expect(map('explicitName', violatingModules)).to.have.members([
                    'b@0.0.1'
                ]);}))
    );
});

    describe('with all parameters', function() {

        const licenseWhitelist = memo().is(() => []);
        const exceptionWhitelist = memo().is(() => []);
        const moduleWhitelist = memo().is(() => []);
        let violatingModules = null;


        beforeEach(Promise.coroutine(function*() {
            let allModules;
            const whitelist = {
                licenses: licenseWhitelist(),
                licenseExceptions: exceptionWhitelist(),
                modules: moduleWhitelist()
            };

            const options = {
                dev: false,
                path: testDataPathA
            };

            return {allModules, violatingModules} = yield advocate(whitelist, options);
        })
        );

        describe('license whitelist', function() {
            licenseWhitelist.is(() => ['MIT', 'JSON']);

            it('contains violating modules', () => expect(map('explicitName', violatingModules)).to.have.members(['c@0.0.1']));

            it('doesn\'t contains non-violating modules', () => expect(map('explicitName', violatingModules)).to.not.contain('b@0.0.1'));

            return describe('in combination with exception white list', function() {
                licenseWhitelist.is(() => ['Apache-2.0']);
                exceptionWhitelist.is(() => ['LZMA-exception']);

                it('contains violating modules', () => expect(map('explicitName', violatingModules)).to.have.members(['b@0.0.1']));

                return it('doesn\'t contains non-violating modules', () => expect(map('explicitName', violatingModules)).to.not.contain('c@0.0.1'));
            });
        });

        return describe('module whitelist', function() {
            moduleWhitelist.is(() => [{
                name: 'b',
                version: '0.0.1',
                licenseDescriptor: 'JSON AND MIT'
            }
            ] );

            it('contains violating modules', () => expect(map('explicitName', violatingModules)).to.have.members(['c@0.0.1']));

            return it('doesn\'t contains non-violating modules', () => expect(map('explicitName', violatingModules)).to.not.contain('b@0.0.1'));
        });
    });

    return describe('yarn.lock present', () =>

        it('should not throw error from npm list', Promise.coroutine(function*() {
            let allModules;
            const whitelist =
                {licenses: ['MIT', 'JSON']};

            const options = {
                dev: false,
                path: testDataPathB
            };

            return {allModules} = yield advocate(whitelist, options);
        })
        )
    );
});
