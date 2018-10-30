/**
 * @fileoverview Forbid excess trailing whitespace in type assertion.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-type-assertion-whitespace"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-type-assertion-whitespace", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "const foo = <number>    (3);",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
