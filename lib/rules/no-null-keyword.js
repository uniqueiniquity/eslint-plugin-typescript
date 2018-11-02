/**
 * @fileoverview Forbids usage of the keyword 'null'.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Forbids usage of the keyword 'null'.",
            category: "Fill me in",
            recommended: false
        },
        fixable: "code", // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    /**
     * @param {utilTypes.Context} context Linting context
     * @returns {*} Rule listeners
     */
    create(context) {
        const FAILURE_STRING = "Use 'undefined' instead of 'null'";

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * @param {ESTree.BinaryOperator} operator A binary expression operator
         * @returns {{ strict: boolean }| null} Returns true iff the operator is an equality operator
         */
        function getEqualsKind(operator) {
            switch (operator) {
                case "==":
                case "!=":
                    return { strict: false };
                case "===":
                case "!==":
                    return { strict: true };
                default:
                    return null;
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            /**
             * @param {ESTree.Literal} node An ESTree literal
             * @returns {void}
             */
            Literal(node) {
                if (node.value === null) {
                    const nodeAncestors = context.getAncestors();
                    const parent = nodeAncestors[nodeAncestors.length - 1];
                    let eq = null;

                    if (parent.type === "BinaryExpression") {
                        eq = getEqualsKind(parent.operator);
                    }
                    if (eq === null) {
                        context.report({
                            node,
                            message: FAILURE_STRING
                        });
                    } else if (!eq.strict) {
                        context.report({
                            node,
                            message: FAILURE_STRING,
                            fix(fixer) {
                                return fixer.replaceText(node, "undefined");
                            }
                        });
                    }
                }
            }
        };
    }
};
