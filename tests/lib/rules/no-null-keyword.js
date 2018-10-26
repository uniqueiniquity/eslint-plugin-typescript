/**
 * @fileoverview Forbids usage of the keyword &#39;null&#39;.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-null-keyword"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-null-keyword", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "const foo = null;",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
