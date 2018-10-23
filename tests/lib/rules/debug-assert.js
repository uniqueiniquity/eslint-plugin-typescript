/**
 * @fileoverview Lint debug statements
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/debug-assert"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("debug-assert", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "Debug.assert(false, 3);",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
