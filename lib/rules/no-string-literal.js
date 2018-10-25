/**
 * @fileoverview Disallows unneeded string literal property accesses.
 * @author Benjamin Lichtman
 */
"use strict";
const ts = require("typescript");
const tsutils = require("tsutils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallows unneeded string literal property accesses.",
            category: "Fill me in",
            recommended: false
        },
        fixable: null, // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    /**
     * @param {utilTypes.Context} context Linting context
     * @returns {*} Rule listeners
     */
    create(context) {
        const FAILURE_STRING =
            "object access via string literals is disallowed";

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            /**
             * @param {ESTree.MemberExpression} node An ESTree member expression
             * @returns {void}
             */
            MemberExpression(node) {
                if (node.computed) {
                    const argument = node.property;

                    if (
                        argument.type === "Literal" &&
                        typeof argument.value === "string" &&
                        tsutils.isValidPropertyAccess(argument.value)
                    ) {
                        // typescript@<2.5.0 has an extra underscore in escaped identifier text content,
                        // to avoid fixing issue `expr['__foo'] → expr.___foo`, unescapeIdentifier() is to be used
                        // As of typescript@3, unescapeIdentifier() removed, thus check in runtime, if the method exists
                        // tslint:disable-next-line no-unsafe-any strict-boolean-expressions
                        const unescapeIdentifier =
                            ts.unescapeIdentifier || (x => x);
                        const propertyName = unescapeIdentifier(argument.value);

                        context.report({
                            node: argument,
                            message: FAILURE_STRING,
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [node.object.range[1], node.range[1]],
                                    `.${propertyName}`
                                );
                            }
                        });
                    }
                }
            }
        };
    }
};
