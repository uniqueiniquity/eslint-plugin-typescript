/**
 * @fileoverview Requires a &#39;for-of&#39; loop if the index is only used to access the iterated array.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/prefer-for-of"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("prefer-for-of", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "const arr = [3,4,5]; for (var i = 0; i < arr.length; i++) { console.log(arr[i]); }",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
