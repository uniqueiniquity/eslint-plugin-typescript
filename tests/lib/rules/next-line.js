/**
 * @fileoverview Ensure catch and else are not on the same line as the preceding block&#39;s curly brace.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/next-line"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("next-line", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "try { throw new Error(); } catch { console.log(\"error\"); }",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
