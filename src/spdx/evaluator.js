// Evaluation according to the SPDX specification
// see Appendix IV of http://spdx.org/sites/spdx/files/SPDX-2.0.pdf
export default function (evalLicense, evalException) {
  const evaluate = (ast) => {
    if (ast.conjunction != null) {
      switch (ast.conjunction) {
        case 'and':
          return evaluate(ast.left) && evaluate(ast.right)
        case 'or':
          return evaluate(ast.left) || evaluate(ast.right)
        default:
          throw Error('unknown AST conjunction', ast)
      }
    } else if (ast.exception != null) {
      return (evalLicense(ast.license)) && (evalException(ast.exception))
    } else if (ast.license != null) {
      return evalLicense(ast.license)
    } else {
      throw Error('unknown AST node', ast)
    }
  }

  return evaluate
}

