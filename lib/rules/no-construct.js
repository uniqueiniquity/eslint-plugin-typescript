/**
 * @fileoverview Disallow use of the constructors for Number, String, and Boolean
 * @author Benjamin Lichtman
 */
"use strict";

/**
 * @typedef {import("estree").NewExpression} NewExpression
 * @typedef {import("../util").Context} Context
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Disallow use of the constructors for Number, String, and Boolean",
            category: "Fill me in",
            recommended: false
        },
        fixable: null, // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    /**
     * @param {Context} context The linting context
     * @returns {*} Rule listeners
     */
    create(context) {
        // variables should be defined here

        const sourceCode = context.getSourceCode();
        const FAILURE_STRING =
            "Forbidden constructor, use a literal or simple function call instead";

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            /**
             * @param {NewExpression} node An ESTree new expression
             * @returns {void}
             */
            NewExpression(node) {
                if (node.callee.type === "Identifier") {
                    switch (node.callee.name) {
                        case "Boolean":
                        case "String":
                        case "Number":
                            context.report({
                                loc: {
                                    start: sourceCode.getLocFromIndex(
                                        node.range[0]
                                    ),
                                    end: sourceCode.getLocFromIndex(
                                        node.callee.range[1]
                                    )
                                },
                                message: FAILURE_STRING
                            });
                            break;
                        default:
                            break;
                    }
                }
            }
        };
    }
};
