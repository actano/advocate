# Evaluation according to the SPDX specification
# see Appendix IV of http://spdx.org/sites/spdx/files/SPDX-2.0.pdf
module.exports = (evalLicense, evalException) ->
    evaluate = (ast) ->
        if ast.conjunction?
            switch ast.conjunction
                when 'and'
                    return evaluate(ast.left) and evaluate(ast.right)
                when 'or'
                    return evaluate(ast.left) or evaluate(ast.right)
                else
                    throw Error 'unknown AST conjunction', ast
        else if ast.exception?
            return (evalLicense ast.license) and (evalException ast.exception)
        else if ast.license?
            return evalLicense ast.license
        else
            throw Error 'unknown AST node', ast

    return evaluate

