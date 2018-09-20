/**
 * @fileoverview Rule to disallow iterating over an array with a for-in loop
 * @author Benjamin Lichtman
 */

"use strict";
const ts = require("typescript");

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
    create: function(context) {
        return {
            ForInStatement(node) {
                if (!context.parserServices || !context.parserServices.program) {
                    return;
                }

                const checker = context.parserServices.program.getTypeChecker();
                const originalNode = context.parserServices.esTreeNodeToTSNodeMap.get(node);
                
                if (!originalNode) {
                    return;
                }

                const type = checker.getTypeAtLocation(originalNode.expression);
                if (type.symbol !== undefined && type.symbol.name === "Array" ||
                    (type.flags & ts.TypeFlags.StringLike) !== 0) {
                    context.report({
                        node,
                        message:
                            "for-in loops over arrays are forbidden. Use for-of or array.forEach instead."
                    })
                }
            }
        };
    }
};