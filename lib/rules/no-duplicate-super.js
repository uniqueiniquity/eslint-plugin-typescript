/**
 * @fileoverview Ensures that 'super()' is not called more than once in a constructor.
 * @author Benjamin Lichtman
 */
"use strict";

/**
 * @typedef {import("../util").Context} Context
 * @typedef {{ node: ESTree.CallExpression, break: boolean }} Single
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Ensures that 'super()' is not called more than once in a constructor.",
            category: "Fill me in",
            recommended: false
        },
        fixable: null, // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    /**
     * @param {Context} context Linting context
     * @returns {*} Rule listeners
     */
    create(context) {
        const sourceCode = context.getSourceCode();

        const NoSuper = 0;
        const Return = 1;
        const Break = 2;

        /**
         * @typedef {typeof NoSuper | typeof Break | typeof Return } Kind
         * @typedef {Kind | Single} Super
         */

        const FAILURE_STRING_DUPLICATE =
            "Multiple calls to 'super()' found. It must be called only once.";
        const FAILURE_STRING_LOOP =
            "'super()' called in a loop. It must be called only once.";

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * @param {ESTree.Node} node An ESTree node
         * @returns {boolean} Returns true iff node is a iteration statement.
         */
        function isIterationStatement(node) {
            switch (node.type) {
                case "ForStatement":
                case "ForInStatement":
                case "ForOfStatement":
                case "WhileStatement":
                case "DoWhileStatement":
                    return true;
                default:
                    return false;
            }
        }

        /**
         * If/else run separately, so return the branch more likely to result in eventual errors.
         * @param {Super} a An object containing information about potential 'super()' calls.
         * @param {Super} b An object containing information about potential 'super()' calls.
         * @returns {Super} Returns the Super object more likely to result in errors for reporting.
         */
        function worse(a, b) {
            if (typeof a === "number") {
                if (typeof b === "number") {
                    if (a < b) {
                        return b;
                    }
                    return a;
                }
                return b;
            }

            if (typeof b === "number") {
                return a;
            }

            if (a.break) {
                return b;
            }
            return a;
        }

        /**
         * @param {ESTree.Node} a An ESTree node
         * @param {ESTree.Node} b An ESTree node
         * @returns {void}
         */
        function addDuplicateFailure(a, b) {
            context.report({
                loc: {
                    start: sourceCode.getLocFromIndex(a.range[0]),
                    end: sourceCode.getLocFromIndex(b.range[1])
                },
                message: FAILURE_STRING_DUPLICATE
            });
        }

        /**
         * Combines children that come one after another.
         * (As opposed to if/else, switch, or loops, which need their own handling.)
         * @param {ESTree.Node} node An ESTree node
         * @returns {Super} Returns an object containing information about potential 'super()' calls.
         */
        function combineSequentialChildren(node) {
            /**
             * @type {Single | null}
             */
            let seenSingle = null;
            /**
             * @type {Super | null}
             */
            let res = null;

            for (const childType of sourceCode.visitorKeys[node.type]) {
                const childSuper = getSuperForNode(node[childType], node); // eslint-disable-line no-use-before-define

                switch (childSuper) {
                    case NoSuper:
                        break;

                    case Break:
                        if (seenSingle !== null) {
                            res = Object.assign(seenSingle, {
                                break: true
                            });
                        } else {
                            res = childSuper;
                        }
                        break;

                    case Return:
                        res = childSuper;
                        break;

                    default:
                        if (seenSingle !== null && !seenSingle.break) {
                            addDuplicateFailure(
                                seenSingle.node,
                                childSuper.node
                            );
                        }
                        seenSingle = /** @type {Single} */ (childSuper);
                        break;
                }

                if (res) {
                    break;
                }
            }

            if (res !== null) {
                return res;
            }

            if (seenSingle !== null) {
                return seenSingle;
            }

            return NoSuper;
        }

        /**
         * @param {ESTree.SwitchStatement} node An ESTree switch statement
         * @returns {Super} Returns an object with information about potential 'super()' calls.
         */
        function getSuperForSwitch(node) {
            /**
             * 'super()' from any clause. Used to track whether 'super()' happens in the switch at all.
             * @type {ESTree.CallExpression | null}
             */
            let foundSingle = null;
            /**
             * 'super()' from the previous clause if it did not 'break;'.
             * @type {ESTree.CallExpression | null}
             */
            let fallthroughSingle = null;

            for (const clause of node.cases) {
                const clauseSuper = combineSequentialChildren(clause);

                switch (clauseSuper) {
                    case NoSuper:
                        break;

                    case Break:
                        fallthroughSingle = null;
                        break;

                    case Return:
                        return NoSuper;

                    default:
                        if (fallthroughSingle !== null) {
                            addDuplicateFailure(
                                fallthroughSingle,
                                clauseSuper.node
                            );
                        }
                        if (!clauseSuper.break) {
                            fallthroughSingle = clauseSuper.node;
                        }
                        foundSingle = clauseSuper.node;
                }
            }

            return foundSingle !== null
                ? { node: foundSingle, break: false }
                : NoSuper;
        }

        /**
         * @param {ESTree.Node} node An ESTree node
         * @param {ESTree.Node} parent An ESTree node
         * @returns {Super} Returns an object with information about potential 'super()' calls.
         */
        function getSuperForNode(node, parent) {
            if (isIterationStatement(node)) {
                const bodySuper = combineSequentialChildren(node);

                if (typeof bodySuper === "number") {
                    return NoSuper;
                }
                if (!bodySuper.break) {
                    context.report({
                        node: bodySuper.node,
                        message: FAILURE_STRING_LOOP
                    });
                }
                return Object.assign(bodySuper, { break: false });
            }

            switch (node.type) {
                case "ReturnStatement":
                case "ThrowStatement":
                    return Return;

                case "BreakStatement":
                    return Break;

                case "ClassDeclaration":
                case "ClassExpression":
                    // 'super()' is bound differently inside, so ignore.
                    return NoSuper;

                case "Super":
                    return parent.type === "CallExpression" &&
                        parent.callee === node
                        ? { node: parent, break: false }
                        : NoSuper;

                case "ConditionalExpression": {
                    const inCondition = getSuperForNode(node.test, node);
                    const inBranches = worse(
                        getSuperForNode(node.consequent, node),
                        getSuperForNode(node.alternate, node)
                    );

                    if (
                        typeof inCondition !== "number" &&
                        typeof inBranches !== "number"
                    ) {
                        addDuplicateFailure(inCondition.node, inBranches.node);
                    }
                    return worse(inCondition, inBranches);
                }

                case "IfStatement": {
                    return worse(
                        getSuperForNode(node.consequent, node),
                        node.alternate
                            ? getSuperForNode(node.alternate, node)
                            : NoSuper
                    );
                }

                case "SwitchStatement":
                    return getSuperForSwitch(node);

                default:
                    return combineSequentialChildren(node);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            /**
             * @param {ESTree.MethodDefinition} node An ESTree method definiton
             * @returns {void}
             */
            MethodDefinition(node) {
                if (node.kind === "constructor" && node.value.body !== null) {
                    getSuperForNode(node.value.body, node.value);
                }
            }
        };
    }
};
