/* eslint-disable no-unused-expressions */
import sinon from 'sinon'
import { expect } from 'chai'
import memo from 'memo-is'

import { Evaluator } from '../../src/lib/license-whitelisted'

describe('spdx evaluator', () => {
  let evaluate = null
  const evalLicense = memo().is(() => sinon.stub().returns(false))
  const evalException = memo().is(() => sinon.stub().returns(false))

  beforeEach(() => {
    const evaluator = new Evaluator(evalLicense(), evalException())
    evaluate = ast => evaluator.evaluate(ast)
  })

  describe('leaf node: license', () => {
    it('should return true if evalLicence returns true', () => {
      evalLicense().withArgs('A').returns(true)

      const ast =
        { license: 'A' }

      expect(evaluate(ast)).to.be.true
    })

    it('should return false if evalLicence returns false', () => {
      evalLicense().withArgs('A').returns(true)

      const ast =
        { license: 'B' }

      expect(evaluate(ast)).to.be.false
    })
  })

  describe('leaf node: license with exception', () => {
    let ast = null

    beforeEach(() => {
      ast = {
        license: 'A',
        exception: 'E',
      }
    })

    it('should return false if both evalLicense and evalException returns false', () => {
      evalLicense().withArgs('A').returns(false)
      evalException().withArgs('E').returns(false)
      expect(evaluate(ast)).to.be.false
    })

    it('should return false if evalLicense returns false and evalException returns true', () => {
      evalLicense().withArgs('A').returns(false)
      evalException().withArgs('E').returns(true)
      expect(evaluate(ast)).to.be.false
    })

    it('should return false if evalLicense returns true and evalException returns false', () => {
      evalLicense().withArgs('A').returns(true)
      evalException().withArgs('E').returns(false)
      expect(evaluate(ast)).to.be.false
    })

    it('should return true if both evalLicense and evalException returns true', () => {
      evalLicense().withArgs('A').returns(true)
      evalException().withArgs('E').returns(true)
      expect(evaluate(ast)).to.be.true
    })
  })

  describe('leaf node: unknown ast node', () => {
    const ast = {}

    it('should throw error if getting unknown node', () => expect(() => evaluate(ast)).to.throw(Error))
  })

  describe('binary node: "and" conjunction', () => {
    let ast = null

    beforeEach(() => {
      ast = {
        conjunction: 'and',
        left: {
          license: 'A',
        },
        right: {
          license: 'B',
        },
      }
    })

    it('should return false if both evalLicense returns false', () => {
      evalLicense().withArgs('A').returns(false)
      evalLicense().withArgs('B').returns(false)
      expect(evaluate(ast)).to.be.false
    })

    it('should return false if left evalLicense returns false', () => {
      evalLicense().withArgs('A').returns(false)
      evalLicense().withArgs('B').returns(true)
      expect(evaluate(ast)).to.be.false
    })

    it('should return false if right evalLicense returns false', () => {
      evalLicense().withArgs('A').returns(true)
      evalLicense().withArgs('B').returns(false)
      expect(evaluate(ast)).to.be.false
    })

    it('should return true if both evalLicense returns true', () => {
      evalLicense().withArgs('A').returns(true)
      evalLicense().withArgs('B').returns(true)
      expect(evaluate(ast)).to.be.true
    })
  })

  describe('binary node: "or" conjunction', () => {
    let ast = null

    beforeEach(() => {
      ast = {
        conjunction: 'or',
        left: {
          license: 'A',
        },
        right: {
          license: 'B',
        },
      }
    })

    it('should return false if both evalLicense returns false', () => {
      evalLicense().withArgs('A').returns(false)
      evalLicense().withArgs('B').returns(false)
      expect(evaluate(ast)).to.be.false
    })

    it('should return true if left evalLicense returns false', () => {
      evalLicense().withArgs('A').returns(false)
      evalLicense().withArgs('B').returns(true)
      expect(evaluate(ast)).to.be.true
    })

    it('should return true if right evalLicense returns false', () => {
      evalLicense().withArgs('A').returns(true)
      evalLicense().withArgs('B').returns(false)
      expect(evaluate(ast)).to.be.true
    })

    it('should return true if both evalLicense returns true', () => {
      evalLicense().withArgs('A').returns(true)
      evalLicense().withArgs('B').returns(true)
      expect(evaluate(ast)).to.be.true
    })
  })

  describe('binary node: unknown conjunction', () => {
    let ast = null

    beforeEach(() => {
      ast = { conjunction: 'erroneous-conjunction' }
    })

    it('should throw error if getting unknown conjunction', () => expect(() => evaluate(ast)).to.throw(Error))
  })

  describe('nested ast', () => {
    let ast = null

    beforeEach(() => {
      ast = {
        conjunction: 'or',
        left: {
          conjunction: 'and',
          left: {
            license: 'A',
          },
          right: {
            license: 'B',
          },
        },
        right: {
          license: 'C',
        },
      }
    })

    it('should return true if tree is semantically true', () => {
      evalLicense().withArgs('A').returns(true)
      evalLicense().withArgs('B').returns(true)
      evalLicense().withArgs('C').returns(false)
      expect(evaluate(ast)).to.be.true
    })

    it('should return false if tree is semantically false', () => {
      evalLicense().withArgs('A').returns(false)
      evalLicense().withArgs('B').returns(true)
      evalLicense().withArgs('C').returns(false)
      expect(evaluate(ast)).to.be.false
    })
  })
})
