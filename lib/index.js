/**
 * @fileoverview TypeScript plugin for ESLint
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");
const path = require("path");

//------------------------------------------------------------------------------
// Environment calculation
//------------------------------------------------------------------------------

/**
 * Calculate project environment using options provided by eslint
 * @param {Object} options Options provided by ESLint core
 * @returns {{project: {parserOptions: Object}}} Set of environments provided by this plugin.
 */
function calculateProjectParserOptions(options) {
    return { test: options.cwd };
}

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(path.join(__dirname, "rules"));
module.exports.environments = {
    project: { parserOptions: calculateProjectParserOptions }
};
