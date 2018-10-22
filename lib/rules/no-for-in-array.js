/**
 * @fileoverview Rule to disallow iterating over an array with a for-in loop
 * @author Benjamin Lichtman
 */

"use strict";
const ts = require("typescript");
const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallow iterating over an array with a for-in loop",
            category: "Possible Errors",
            recommended: true
            // url: "https://eslint.org/docs/rules/no-extra-semi"
        },
        schema: [] // no options
    },
    create(context) {
        return {
            ForInStatement(node) {
                const program = util.getProgramOrNull(context);

                if (!program) {
                    return;
                }

                /**
                 * @type {ts.TypeChecker}
                 */
                const checker = program.getTypeChecker();

                /**
                 * @type {ts.ForInStatement | null}
                 */
                const originalNode = util.getTSNodeOrNull(context, node);

                if (!originalNode) {
                    return;
                }

                const type = checker.getTypeAtLocation(originalNode.expression);

                if (
                    (typeof type.symbol !== "undefined" &&
                        type.symbol.name === "Array") ||
                    (type.flags & ts.TypeFlags.StringLike) !== 0
                ) {
                    context.report({
                        node,
                        message:
                            "for-in loops over arrays are forbidden. Use for-of or array.forEach instead."
                    });
                }
            }
        };
    }
};
