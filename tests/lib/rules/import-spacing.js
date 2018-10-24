/**
 * @fileoverview Ensures proper spacing between import statement keywords
 * @author Benjamin Lichtman
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/import-spacing"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("import-spacing", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "import  hello from \"goodbye\";",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
