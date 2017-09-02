/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import sinon from 'sinon';
import { expect } from 'chai';
import memo from 'memo-is';

describe('spdx evaluator', function() {
    let createEvaluator = null;

    before('require', () => createEvaluator = require('../../src/spdx/evaluator'));

    let evaluate = null;
    const evalLicense = memo().is(() => sinon.stub().returns(false));
    const evalException = memo().is(() => sinon.stub().returns(false));

    beforeEach(() => evaluate = createEvaluator(evalLicense(), evalException()));

    describe('leaf node: license', function() {
        it('should return true if evalLicence returns true', function() {
            evalLicense().withArgs('A').returns(true);

            const ast =
                {license: 'A'};

            return expect(evaluate(ast)).to.be.true;
        });

        return it('should return false if evalLicence returns false', function() {
            evalLicense().withArgs('A').returns(true);

            const ast =
                {license: 'B'};

            return expect(evaluate(ast)).to.be.false;
        });
    });

    describe('leaf node: license with exception', function() {
        let ast = null;

        beforeEach(() =>
            ast = {
                license: 'A',
                exception: 'E'
            }
        );

        it('should return false if both evalLicense and evalException returns false', function() {
            evalLicense().withArgs('A').returns(false);
            evalException().withArgs('E').returns(false);
            return expect(evaluate(ast)).to.be.false;
        });

        it('should return false if evalLicense returns false and evalException returns true', function() {
            evalLicense().withArgs('A').returns(false);
            evalException().withArgs('E').returns(true);
            return expect(evaluate(ast)).to.be.false;
        });

        it('should return false if evalLicense returns true and evalException returns false', function() {
            evalLicense().withArgs('A').returns(true);
            evalException().withArgs('E').returns(false);
            return expect(evaluate(ast)).to.be.false;
        });

        return it('should return true if both evalLicense and evalException returns true', function() {
            evalLicense().withArgs('A').returns(true);
            evalException().withArgs('E').returns(true);
            return expect(evaluate(ast)).to.be.true;
        });
    });

    describe('leaf node: unknown ast node', function() {
        const ast = {};

        return it('should throw error if getting unknown node', () => expect(() => evaluate(ast)).to.throw(Error));
    });


    describe('binary node: "and" conjunction', function() {
        let ast = null;

        beforeEach(() =>
            ast = {
                conjunction: 'and',
                left: {
                    license: 'A'
                },
                right: {
                    license: 'B'
                }
            }
        );

        it('should return false if both evalLicense returns false', function() {
            evalLicense().withArgs('A').returns(false);
            evalLicense().withArgs('B').returns(false);
            return expect(evaluate(ast)).to.be.false;
        });

        it('should return false if left evalLicense returns false', function() {
            evalLicense().withArgs('A').returns(false);
            evalLicense().withArgs('B').returns(true);
            return expect(evaluate(ast)).to.be.false;
        });

        it('should return false if right evalLicense returns false', function() {
            evalLicense().withArgs('A').returns(true);
            evalLicense().withArgs('B').returns(false);
            return expect(evaluate(ast)).to.be.false;
        });

        return it('should return true if both evalLicense returns true', function() {
            evalLicense().withArgs('A').returns(true);
            evalLicense().withArgs('B').returns(true);
            return expect(evaluate(ast)).to.be.true;
        });
    });

    describe('binary node: "or" conjunction', function() {
        let ast = null;

        beforeEach(() =>
            ast = {
                conjunction: 'or',
                left: {
                    license: 'A'
                },
                right: {
                    license: 'B'
                }
            }
        );

        it('should return false if both evalLicense returns false', function() {
            evalLicense().withArgs('A').returns(false);
            evalLicense().withArgs('B').returns(false);
            return expect(evaluate(ast)).to.be.false;
        });

        it('should return true if left evalLicense returns false', function() {
            evalLicense().withArgs('A').returns(false);
            evalLicense().withArgs('B').returns(true);
            return expect(evaluate(ast)).to.be.true;
        });

        it('should return true if right evalLicense returns false', function() {
            evalLicense().withArgs('A').returns(true);
            evalLicense().withArgs('B').returns(false);
            return expect(evaluate(ast)).to.be.true;
        });

        return it('should return true if both evalLicense returns true', function() {
            evalLicense().withArgs('A').returns(true);
            evalLicense().withArgs('B').returns(true);
            return expect(evaluate(ast)).to.be.true;
        });
    });

    describe('binary node: unknown conjunction', function() {
        let ast = null;

        beforeEach(() =>
            ast =
                {conjunction: 'erroneous-conjunction'}
        );

        return it('should throw error if getting unknown conjunction', () => expect(() => evaluate(ast)).to.throw(Error));
    });

    return describe('nested ast', function() {
        let ast = null;

        beforeEach(() =>
            ast = {
                conjunction: 'or',
                left: {
                    conjunction: 'and',
                    left: {
                        license: 'A'
                    },
                    right: {
                        license: 'B'
                    }
                },
                right: {
                    license: 'C'
                }
            }
        );

        it('should return true if tree is semantically true', function() {
            evalLicense().withArgs('A').returns(true);
            evalLicense().withArgs('B').returns(true);
            evalLicense().withArgs('C').returns(false);
            return expect(evaluate(ast)).to.be.true;
        });

        return it('should return false if tree is semantically false', function() {
            evalLicense().withArgs('A').returns(false);
            evalLicense().withArgs('B').returns(true);
            evalLicense().withArgs('C').returns(false);
            return expect(evaluate(ast)).to.be.false;
        });
    });
});
