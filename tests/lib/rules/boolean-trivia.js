/**
 * @fileoverview Ensure boolean arguments passed to functions are tagged with their corresponding parameter names.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/boolean-trivia"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("boolean-trivia", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "const x = foo(true);",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
