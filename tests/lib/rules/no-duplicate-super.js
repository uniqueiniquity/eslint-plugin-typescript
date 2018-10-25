/**
 * @fileoverview Ensures that &#39;super()&#39; is not called more than once in a constructor.
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-duplicate-super"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-duplicate-super", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "class Foo extends Bar { constructor() { super(); super(); }}",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
