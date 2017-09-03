import flow from 'lodash/flow'
import pickBy from 'lodash/fp/pickBy'
import map from 'lodash/fp/map'
import some from 'lodash/some'
import keys from 'lodash/keys'

const specialWords = [
  'licen[sc]e',
]

const licensePatternOfText = (text) => {
  let pattern = ''
  let isRegExpChar = false
  for (const char of text.replace(/\s+/g, ' ')) {
    if (isRegExpChar) {
      if (char === '~') {
        isRegExpChar = false
      } else {
        pattern += char
      }
    } else {
      switch (false) {
        case char !== '~':
          isRegExpChar = true
          break
        case !char.match(/[A-Za-z]/):
          pattern += char
          break
        case !char.match(/\s/):
          pattern += '\\s+'
          break
        case !char.match(/[0-9]/):
          pattern += `\\s*${char}?\\s*`
          break
        default:
          pattern += `\\s*\\${char}?\\s*`
      }
    }
  }

  for (const specialWord of specialWords) {
    pattern = pattern.replace(new RegExp(specialWord, 'ig'), specialWord)
  }

  return new RegExp(pattern, 'i')
}

const licenseMatchingMap = {
  BSD: [
    /\bBSD\s+Licen[sc]e\b/i,
  ],
  'Apache-2.0': [
    /\bApache\s+Licen[sc]e\b([\s\S])*Version 2\.0/i,
  ],
  MIT: [
    /\bMIT\s+Licen[sc]e(d)?\b/i,
    /\bLicen[sc]e(:)?\s+MIT\b/i,
    licensePatternOfText(`\
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without
limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\
`,
    ),
  ],
  Unlicense: [
    /unlicense\.org/i,
  ],
  'Public-Domain': [
    /\bPublic\s+Domain\b/i,
  ],
  WTFPL: [
    /\bDO\s+WHAT\s+THE\s+FUCK\s+YOU\s+WANT\s+TO\s+PUBLIC\s+LICENSE\b/i,
  ],
  '#Chris-Andrews': [
    licensePatternOfText(`\
Copyright ~[0-9]{4}~ Chris Andrews. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY CHRIS ANDREWS \`\`AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL CHRIS ANDREWS OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\
`,
    ),
  ],
}

export default function (text) {
  const matchesText = expression => expression.test(text)

  const someExpressionMatchesText = regularExpressions => some(regularExpressions, matchesText)

  const addSuffix = license => `${license}*`

  const guessLicenses = flow(
    pickBy(someExpressionMatchesText),
    keys,
    map(addSuffix),
  )

  return guessLicenses(licenseMatchingMap)
}
