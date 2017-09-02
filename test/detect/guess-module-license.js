/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { expect } from 'chai';
import sinon from 'sinon';

describe('guessing licenses of a module', function() {

    let guessModuleLicenseFactory = null;

    before('require', () => guessModuleLicenseFactory = require('../../src/detect/guess-module-license'));

    let sandbox = null;

    beforeEach('sandbox', () => sandbox = sinon.sandbox.create());

    afterEach('sandbox', () => sandbox.restore());

    let guessModuleLicense = null;
    let fs = null;

    beforeEach(function() {
        fs = {
            readFileSync: sandbox.stub(),
            readdirSync: sandbox.stub(),
            existsSync: sandbox.stub()
        };
        return guessModuleLicense = guessModuleLicenseFactory(fs);
    });

    it('guesses no license', function() {
        const module =
            {name: 'A'};
        return expect(guessModuleLicense(module)).to.be.null;
    });

    context('via readme property', () =>

        it('guesses licenses', function() {
            const module =
                {readme: '... MIT License ...'};
            return expect(guessModuleLicense(module)).have.members(['MIT*']);
    })
);

    context('via files property', function() {

        it('guesses licenses by file content', function() {
            const module = {
                path: '/some/dir',
                files: [
                    'README.txt',
                    'LICENCE.md',
                    'LICENSE.md'
                ]
            };

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns('... MIT License ...')
                .withArgs('/some/dir/LICENSE.md').returns('... BSD License ...')
                .withArgs('/some/dir/LICENCE.md').returns('... Apache License Version 2.0  ...');

            return expect(guessModuleLicense(module)).to.have.members(['MIT*', 'BSD*', 'Apache-2.0*']);
    });

        it('guesses licenses by file name', function() {
            const module = {
                path: '/some/dir',
                files: [
                    'MIT-LICENSE.txt'
                ]
            };

            fs.readFileSync
            .withArgs('/some/dir/MIT-LICENCE.txt').returns('...');

            return expect(guessModuleLicense(module)).to.have.members(['MIT*']);
    });

        return it('ignores files that don\'t match README or LICENSE naming', function() {
            const module = {
                path: '/some/dir',
                files: [
                    'README.txt',
                    'IgnoreMe.txt'
                ]
            };

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns('... MIT License ...')
                .withArgs('/some/dir/IgnoreMe.txt').returns('... BSD License ...');

            return expect(guessModuleLicense(module)).to.not.contain('BSD*');
        });
    });

    return context('via contents of module directory', function() {

        it('guesses licenses', function() {
            const module =
                {path: '/some/dir'};

            fs.existsSync.withArgs('/some/dir').returns(true);
            fs.readdirSync.withArgs('/some/dir').returns([
                'README.txt',
                'LICENSE.txt',
                'LICENCE.md'
            ]);

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns('... MIT License ...')
                .withArgs('/some/dir/LICENSE.txt').returns('... BSD License ...')
                .withArgs('/some/dir/LICENCE.md').returns('... Apache License Version 2.0  ...');

            return expect(guessModuleLicense(module)).to.have.members(['MIT*', 'BSD*', 'Apache-2.0*']);
    });

        it('ignores files that don\'t match README or LICENSE naming', function() {
            const module =
                {path: '/some/dir'};

            fs.existsSync.withArgs('/some/dir').returns(true);
            fs.readdirSync.withArgs('/some/dir').returns([
                'README.txt',
                'IgnoreMe.txt'
            ]);

            fs.readFileSync
                .withArgs('/some/dir/README.txt').returns('... MIT License ...')
                .withArgs('/some/dir/IgnoreMe.txt').returns('... BSD License ...');

            return expect(guessModuleLicense(module)).to.not.contain('BSD*');
        });

        return it('ingores directory if it does not exist', function() {
            const module =
                {path: '/some/dir'};

            fs.existsSync.withArgs('/some/dir').returns(false);

            return expect(guessModuleLicense(module)).to.equal(null);
        });
    });
});
