/**
 * @fileoverview Disallow use of the constructors for Number, String, and Boolean
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-construct"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-construct", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "const x = new String(\"hello\");",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
