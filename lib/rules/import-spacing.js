/**
 * @fileoverview Ensures proper spacing between import statement keywords
 * @author Benjamin Lichtman
 */
"use strict";

/**
 * @typedef {import("../util").Context} Context
 * @typedef {import("../util").ESTreeNode} ESTreeNode
 * @typedef {import("estree").ImportDeclaration} ImportDeclaration
 * @typedef {import("estree").ImportDefaultSpecifier} ImportDefaultSpecifier
 * @typedef {import("estree").ImportNamespaceSpecifier} ImportNamespaceSpecifier
 * @typedef {import("estree").ImportSpecifier} ImportSpecifier
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Ensures proper spacing between import statement keywords",
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
     * @returns {*} AST listener
     */
    create(context) {
        const sourceCode = context.getSourceCode();

        const LINE_BREAK_REGEX = /\r?\n/;

        const ADD_SPACE_AFTER_IMPORT = "Add space after 'import'";
        const TOO_MANY_SPACES_AFTER_IMPORT = "Too many spaces after 'import'";
        const ADD_SPACE_AFTER_STAR = "Add space after '*'";
        const TOO_MANY_SPACES_AFTER_STAR = "Too many spaces after '*'";
        const ADD_SPACE_AFTER_FROM = "Add space after 'from'";
        const TOO_MANY_SPACES_AFTER_FROM = "Too many spaces after 'from'";
        const ADD_SPACE_BEFORE_FROM = "Add space before 'from'";
        const TOO_MANY_SPACES_BEFORE_FROM = "Too many spaces before 'from'";
        const NO_LINE_BREAKS =
            "Line breaks are not allowed in import declaration";

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * @param {number} start The start index of the failure
         * @param {number} end The end index of the failure
         * @param {string} message The failure message
         * @returns {void}
         */
        function addFailure(start, end, message) {
            context.report({
                message,
                loc: {
                    start: sourceCode.getLocFromIndex(start),
                    end: sourceCode.getLocFromIndex(end)
                }
            });
        }

        /**
         * @param {number} start The start index of the failure
         * @param {number} length The length of the failure span
         * @param {string} message The failure message
         * @returns {void}
         */
        function addFailureAt(start, length, message) {
            context.report({
                message,
                loc: {
                    start: sourceCode.getLocFromIndex(start),
                    end: sourceCode.getLocFromIndex(start + length)
                }
            });
        }

        /**
         * @param {ESTreeNode} node The ndoe of the failure
         * @param {string} message The failure message
         * @returns {void}
         */
        function addFailureAtNode(node, message) {
            context.report({
                message,
                node
            });
        }

        /**
         * @param {ImportDeclaration} node An ESTree import declaration node with an import clause
         * @returns {void}
         */
        function checkImportClause(node) {
            const text = sourceCode.getText(node);
            const importDeclarationTokens = sourceCode.getTokens(node);
            const nodeStart = node.range[0];
            const importKeywordEnd = nodeStart + "import".length;
            const moduleSpecifierStart = node.source.range[0];

            const importClauseEnd = // length - 1 is semicolon, length - 2 is the source, length - 3 is the from keyword
                importDeclarationTokens[importDeclarationTokens.length - 4]
                    .range[1];
            const importClauseStart = importDeclarationTokens[1].range[0]; // 0 is the import keyword

            if (importKeywordEnd === importClauseStart) {
                addFailure(nodeStart, "import".length, ADD_SPACE_AFTER_IMPORT);
            } else if (importClauseStart > importKeywordEnd + 1) {
                addFailure(
                    nodeStart,
                    importClauseStart,
                    TOO_MANY_SPACES_AFTER_IMPORT
                );
            }

            const fromString = text.substring(
                importClauseEnd - nodeStart,
                moduleSpecifierStart - nodeStart
            );

            if (/from$/.test(fromString)) {
                addFailureAt(
                    importClauseEnd,
                    fromString.length,
                    ADD_SPACE_AFTER_FROM
                );
            } else if (/from\s{2,}$/.test(fromString)) {
                addFailureAt(
                    importClauseEnd,
                    fromString.length,
                    TOO_MANY_SPACES_AFTER_FROM
                );
            }

            if (/^\s{2,}from/.test(fromString)) {
                addFailureAt(
                    importClauseEnd,
                    fromString.length,
                    TOO_MANY_SPACES_BEFORE_FROM
                );
            } else if (/^from/.test(fromString)) {
                addFailureAt(
                    importClauseEnd,
                    fromString.length,
                    ADD_SPACE_BEFORE_FROM
                );
            }

            const beforeImportClauseText = text.substring(
                0,
                importClauseStart - nodeStart
            );
            const afterImportClauseText = text.substring(
                importClauseEnd - nodeStart
            );

            if (LINE_BREAK_REGEX.test(beforeImportClauseText)) {
                addFailure(nodeStart, importClauseStart - 1, NO_LINE_BREAKS);
            }

            if (LINE_BREAK_REGEX.test(afterImportClauseText)) {
                addFailure(importClauseEnd, node.range[1], NO_LINE_BREAKS);
            }
        }

        /**
         * @param {ImportNamespaceSpecifier} node An ESTree import declaration node
         * @returns {void}
         */
        function checkNamespaceImport(node) {
            const text = sourceCode.getText(node);

            if (text.indexOf("*as") > -1) {
                addFailureAtNode(node, ADD_SPACE_AFTER_STAR);
            } else if (/\*\s{2,}as/.test(text)) {
                addFailureAtNode(node, TOO_MANY_SPACES_AFTER_STAR);
            } else if (LINE_BREAK_REGEX.test(text)) {
                addFailureAtNode(node, NO_LINE_BREAKS);
            }
        }

        /**
         * @param {ImportDeclaration} node An ESTree import declaration node
         * @returns {void}
         */
        function checkModuleWithSideEffect(node) {
            const nodeStart = node.range[0];
            const moduleSpecifierStart = node.source.range[0];

            if (nodeStart + "import".length + 1 < moduleSpecifierStart) {
                addFailure(
                    nodeStart,
                    moduleSpecifierStart,
                    TOO_MANY_SPACES_AFTER_IMPORT
                );
            } else if (nodeStart + "import".length === moduleSpecifierStart) {
                addFailureAt(
                    nodeStart,
                    "import".length,
                    ADD_SPACE_AFTER_IMPORT
                );
            }

            if (LINE_BREAK_REGEX.test(sourceCode.getText(node))) {
                addFailureAtNode(node, NO_LINE_BREAKS);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            /**
             * @param {ImportDeclaration} node An ESTree node
             * @returns {void}
             */
            ImportDeclaration(node) {
                if (node.specifiers.length === 0) {
                    checkModuleWithSideEffect(node);
                } else {
                    checkImportClause(node);
                    for (const specifier of node.specifiers) {
                        if (specifier.type === "ImportNamespaceSpecifier") {
                            checkNamespaceImport(specifier);
                        }
                    }
                }
            }
        };
    }
};
