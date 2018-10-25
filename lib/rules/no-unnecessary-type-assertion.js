/**
 * @fileoverview Rule to warn if a type assertion does not change the type of an expression
 * @author Benjamin Lichtman
 */

"use strict";
const tsutils = require("tsutils");
const ts = require("typescript");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const FAILURE_STRING =
    "This assertion is unnecessary since it does not change the type of the expression.";

/**
 * Sometimes tuple types don't have ObjectFlags.Tuple set, like when they're being matched against an inferred type.
 * So, in addition, check if there are integer properties 0..n and no other numeric keys
 * @param {ts.ObjectType} type type
 * @returns {boolean} true iff type could be a tuple type
 */
function couldBeTupleType(type) {
    const properties = type.getProperties();

    if (properties.length === 0) {
        return false;
    }
    let i = 0;

    for (; i < properties.length; ++i) {
        const name = properties[i].name;

        if (String(i) !== name) {
            if (i === 0) {
                // if there are no integer properties, this is not a tuple
                return false;
            }
            break;
        }
    }
    for (; i < properties.length; ++i) {
        if (String(+properties[i].name) === properties[i].name) {
            return false; // if there are any other numeric properties, this is not a tuple
        }
    }
    return true;
}

/**
 *
 * @param {*} node node being linted
 * @param {*} context linting context
 * @param {ts.TypeChecker} checker TypeScript typechecker
 * @returns {void}
 */
function checkNonNullAssertion(node, context, checker) {
    /**
     * @type {ts.NonNullExpression}
     */
    const originalNode = context.parserServices.esTreeNodeToTSNodeMap.get(node);

    if (!originalNode) {
        return;
    }
    const type = checker.getTypeAtLocation(originalNode.expression);

    if (type === checker.getNonNullableType(type)) {
        context.report({
            node,
            message: FAILURE_STRING,
            fix(fixer) {
                return fixer.removeRange([
                    originalNode.expression.end,
                    originalNode.end
                ]);
            }
        });
    }
}

/**
 *
 * @param {*} node node being linted
 * @param {*} context linting context
 * @param {ts.TypeChecker} checker TypeScript typechecker
 * @returns {void}
 */
function verifyCast(node, context, checker) {
    /**
     * @type {ts.AssertionExpression}
     */
    const originalNode = context.parserServices.esTreeNodeToTSNodeMap.get(node);

    if (!originalNode) {
        return;
    }

    const typesToIgnore = context.options[0];
    if (typesToIgnore && typesToIgnore.indexOf(originalNode.type.getText()) !== -1) {
        return;
    }
    const castType = checker.getTypeAtLocation(originalNode);

    if (
        tsutils.isTypeFlagSet(castType, ts.TypeFlags.Literal) ||
        (tsutils.isObjectType(castType) &&
            (tsutils.isObjectFlagSet(castType, ts.ObjectFlags.Tuple) ||
                couldBeTupleType(castType)))
    ) {
        // It's not always safe to remove a cast to a literal type or tuple
        // type, as those types are sometimes widened without the cast.
        return;
    }

    const uncastType = checker.getTypeAtLocation(originalNode.expression);

    if (uncastType === castType) {
        context.report({
            node,
            message: FAILURE_STRING,
            fix(fixer) {
                return originalNode.kind ===
                    ts.SyntaxKind.TypeAssertionExpression
                    ? fixer.removeRange([
                          originalNode.getStart(),
                          originalNode.expression.getStart()
                      ])
                    : fixer.removeRange([
                          originalNode.expression.end,
                          originalNode.end
                      ]);
            }
        });
    }
}

module.exports = {
    meta: {
        docs: {
            description:
                "Warns if a type assertion does not change the type of an expression",
            category: "TypeScript",
            recommended: true
            // url: "https://eslint.org/docs/rules/no-extra-semi"
        },
        fixable: "code",
        schema: [
            {
                type: "array",
                items: {
                    type: "string"
                }
            }
        ]
    },
    create(context) {
        if (!context.parserServices || !context.parserServices.program) {
            return {};
        }

        const checker = context.parserServices.program.getTypeChecker();

        return {
            TSNonNullExpression(node) {
                checkNonNullAssertion(node, context, checker);
            },
            TSTypeAssertionExpression(node) {
                verifyCast(node, context, checker);
            },
            TSAsExpression(node) {
                verifyCast(node, context, checker);
            }
        };
    }
};