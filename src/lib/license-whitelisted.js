import { parse, valid } from 'spdx'

export class Evaluator {
  constructor(evalLicense, evalLicenseException) {
    this.evalLicense = evalLicense
    this.evalLicenseException = evalLicenseException
  }

  evaluate(ast) {
    if (ast.conjunction) {
      switch (ast.conjunction) {
        case 'and':
          return this.evaluate(ast.left) && this.evaluate(ast.right)
        case 'or':
          return this.evaluate(ast.left) || this.evaluate(ast.right)
        default:
          throw Error('unknown SPDX AST conjunction', ast)
      }
    } else if (ast.exception) {
      return this.evalLicense(ast.license) && this.evalLicenseException(ast.exception)
    } else if (ast.license) {
      return this.evalLicense(ast.license)
    } else {
      throw Error('unknown SPDX AST node', ast)
    }
  }
}

const isWhitelisted = (licenses = [], licenseExceptions = [], license) => {
  if (Array.isArray(license)) {
    for (const l of license) {
      if (isWhitelisted(licenses, licenseExceptions, l)) return true
    }
    return false
  }

  const evalLicense = lic => licenses.includes(lic)
  const evalLicenseException = exception => licenseExceptions.includes(exception)

  if (evalLicense(license)) return true

  if (valid(license)) {
    const evaluator = new Evaluator(evalLicense, evalLicenseException)
    if (evaluator.evaluate(parse(license))) return true
  }

  return false
}

export default isWhitelisted
