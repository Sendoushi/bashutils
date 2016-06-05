'use strict';

// -----------------------------------------
// IMPORTS

var tools = require('./tools/main');
var Joi = tools.check.Joi;

// -----------------------------------------
// VARS

// CreateStruct struct for the project
var struct = Joi.object().keys({
    dest: Joi.string(), // `toml:"destination"`
    type: Joi.string(),
    order: Joi.number(),
    env: Joi.string(),
    sys: Joi.string()
});

// -----------------------------------------
// PUBLIC FUNCTIONS

// -----------------------------------------
// PRIVATE FUNCTIONS

// -----------------------------------------
// EXPORTS

module.exports = { struct: struct };
