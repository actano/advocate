import { expect } from 'chai'
import isWhitelisted from '../../src/lib/author-whitelisted'

describe('author whitelist check', () => {
  it('should return true if author is in whitelist', () => {
    const whitelist = ['author1', 'author2', 'author3']
    const author = { name: 'author2' }

    expect(isWhitelisted(whitelist, author)).to.eq(true)
  })

  it('should return false if author is not in whitelist', () => {
    const whitelist = ['author1', 'author2', 'author3']
    const author = { name: 'author' }

    expect(isWhitelisted(whitelist, author)).to.eq(false)
  })
})
