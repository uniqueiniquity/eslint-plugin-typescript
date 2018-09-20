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
const fs = require("fs");
const ts = require("typescript");

//------------------------------------------------------------------------------
// Environment calculation
//------------------------------------------------------------------------------

/**
 * Create object representation of TypeScript configuration
 * @param {string} tsconfigPath Full path to tsconfig.json
 * @returns {{options: Object, fileNames: string[]}|null} Representation of parsed tsconfig.json
 */
function parseTSConfig(tsconfigPath) {
    // if no tsconfig in cwd, return
    if (!fs.existsSync(tsconfigPath)) {
        return null;
    }

    // Parse tsconfig and create program
    let tsconfigContents;

    try {
        tsconfigContents = fs.readFileSync(tsconfigPath, "utf8");
    } catch (e) {
        // if can't read file, return
        return null;
    }

    const tsconfigParseResult = ts.parseJsonText(
        tsconfigPath,
        tsconfigContents
    );

    return ts.parseJsonConfigFileContent(
        tsconfigParseResult,
        ts.sys,
        path.dirname(tsconfigPath),
        /* existingOptions */ {},
        tsconfigPath
    );
}

/**
 * Calculate project environment using options provided by eslint
 * @param {Object} options Options provided by ESLint core
 * @param {string} options.cwd The current working directory for the eslint process
 * @returns {{program?: Object}} A set of options to be handed to the parser
 */
function calculateProjectParserOptions(options) {
    // if no cwd passed, return
    if (!options.cwd) {
        return {};
    }

    const tsconfigPath = path.join(options.cwd, "tsconfig.json");
    const parsedCommandLine = parseTSConfig(tsconfigPath);

    if (parsedCommandLine === null) {
        return {};
    }

    return {
        program: ts.createProgram(
            parsedCommandLine.fileNames,
            parsedCommandLine.options,
            ts.createCompilerHost(parsedCommandLine.options, /*setParentNodes*/ true)
        )
    };
}

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(path.join(__dirname, "rules"));
module.exports.environments = {
    project: { parserOptions: calculateProjectParserOptions }
};
