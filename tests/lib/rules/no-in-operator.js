/**
 * @fileoverview Forbids the &#39;in&#39; keyword.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-in-operator"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-in-operator", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "const foo = \"x\" in { x: 5 };",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
