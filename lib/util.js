"use strict";

const ts = require("typescript");
const parser = require("typescript-eslint-parser");

/**
 * @typedef { import("typescript").Program } Program
 * @typedef { import("typescript").Node } TSNode
 * @typedef { import("estree").Node } ESTreeNode
 * @typedef { import("eslint").Rule.RuleContext } Context
 * @typedef { import("eslint").SourceCode } SourceCode
 */

exports.tslintRule = name => `\`${name}\` from TSLint`;

/**
 * Check if the context file name is *.ts or *.tsx
 * @param {string} fileName The context file name
 * @returns {boolean} `true` if the file name ends in *.ts or *.tsx
 * @private
 */
exports.isTypescript = fileName => /\.tsx?$/.test(fileName);

/**
 * Gets the TS Program from the context, if it exists
 * @param {Context} context ESLint rule context
 * @returns {Program | null} Returns the TS program from the context, if it exists
 */
exports.getProgramOrNull = function(context) {
    if (!context.parserServices) {
        return null;
    }

    return context.parserServices.program;
};

exports.getTypeChecker = context =>
    context.parserServices.program.getTypeChecker();

/**
 * Gets the TS node corresponding to the provided ESTree node, if possible
 * @template {TSNode} T
 * @param {Context} context ESLint rule context
 * @param {ESTreeNode} node ESTree node
 * @returns {T | null} TS node
 */
exports.getTSNodeOrNull = function(context, node) {
    if (
        !context.parserServices ||
        !context.parserServices.esTreeNodeToTSNodeMap
    ) {
        return null;
    }

    return context.parserServices.esTreeNodeToTSNodeMap.get(node);
};

/**
 * @param {ts.SyntaxKind} syntaxKind A TS syntax kind
 * @returns {string} The corresponding string representation
 */
function getESTreeType(syntaxKind) {
    const tsSyntaxKindName = ts.SyntaxKind[syntaxKind];

    return parser.Syntax[tsSyntaxKindName] || `TS${tsSyntaxKindName}`;
}

/**
 * @param {ESTreeNode} node An ESTree node
 * @param {ts.SyntaxKind} kind A TS node kind
 * @returns {boolean} Returns true iff the ESTree node has the corresponding TS kind
 */
exports.esTreeNodeHasKind = function(node, kind) {
    return node.type === getESTreeType(kind);
};

exports.getESTreeType = getESTreeType;
