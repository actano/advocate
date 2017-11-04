import { expect } from 'chai'
import memo from 'memo-is'
import isWhitelisted from '../../src/lib/license-whitelisted'

describe('license whitelist check', () => {
  const licenseWhitelist = memo().is(() => [])
  const exceptionWhitelist = memo().is(() => [])
  let isLicenseWhitelisted = null

  beforeEach(() => {
    isLicenseWhitelisted = lic => isWhitelisted(licenseWhitelist(), exceptionWhitelist(), lic)
  })

  describe('simple license name', () => {
    context('well known license', () => {
      licenseWhitelist.is(() => ['MIT'])

      it('should return true if name is whitelisted', () => {
        expect(isLicenseWhitelisted('MIT')).to.eq(true)
      })

      it('should return false if name isn\'t whitelisted', () => {
        expect(isLicenseWhitelisted('JSON')).to.eq(false)
      })
    })

    context('random license name', () => {
      licenseWhitelist.is(() => ['FOO'])

      it('should return true if name is whitelisted', () => {
        expect(isLicenseWhitelisted('FOO')).to.eq(true)
      })

      it('should return false if name isn\'t whitelisted', () => {
        expect(isLicenseWhitelisted('BAR')).to.eq(false)
      })

      it('should return true if name is empty', () => {
        expect(isLicenseWhitelisted('')).to.eq(false)
      })

      context('non alpha numeric license name', () => {
        licenseWhitelist.is(() => ['($?!'])

        it('should return true if non alphanumeric name is whitelisted', () => {
          expect(isLicenseWhitelisted('($?!')).to.eq(true)
        })
      })
    })
  })

  describe('array of simple license names', () => {
    licenseWhitelist.is(() => ['FOO'])

    it('should return true if at least one name is whitelisted', () => {
      expect(isLicenseWhitelisted(['BAR', 'FOO'])).to.eq(true)
    })

    it('should return false if no name is whitelisted', () => {
      expect(isLicenseWhitelisted(['BAR', 'BAZ'])).to.eq(false)
    })

    it('should return false if the array is empty', () => {
      expect(isLicenseWhitelisted([])).to.eq(false)
    })
  })

  describe('SPDX license expression', () => {
    licenseWhitelist.is(() => ['MIT', 'JSON'])

    it('should return true if SPDX expression evaluates to true', () => {
      expect(isLicenseWhitelisted('(MIT+ AND (JSON OR AML))')).to.eq(true)
    })

    it('should return false if SPDX expression evaluates to false', () => {
      expect(isLicenseWhitelisted('(MIT+ AND (JSON AND AML))')).to.eq(false)
    })

    describe('with exceptions', () => {
      licenseWhitelist.is(() => ['MIT'])
      exceptionWhitelist.is(() => ['LZMA-exception'])

      it('should return true if expression is using a whitelisted exception', () => {
        expect(isLicenseWhitelisted('MIT WITH LZMA-exception')).to.eq(true)
      })

      it('should return false if expression isn\'t using a whitelisted exception', () => {
        expect(isLicenseWhitelisted('MIT WITH Libtool-exception')).to.eq(false)
      })
    })
  })
})
