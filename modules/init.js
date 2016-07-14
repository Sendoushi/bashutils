'use strict';

// -----------------------------------------
// IMPORTS

var Joi = require('joi');
var Promise = require('bluebird');

var tools = require('./tools/main');
var config = require('./config');

var create = require('./create');
var file = require('./file');
var raw = require('./raw');
var script = require('./script');
var server = require('./server');
var style = require('./style');
var sprite = require('./sprite');

// -----------------------------------------
// VARS

var struct = Joi.object().keys({
    cmd: Joi.string().default('all'),
    order: Joi.number().default(0),
    env: Joi.string().allow('').default(''),
    sys: Joi.string().default('all')
});

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Runs each instance per order
 * @param  {object} bedrockObj
 * @param  {object} configObj
 */
function runOrder(bedrockObj, configObj) {
    var promises;

    tools.validate.type(
        { bedrockObj: bedrockObj, config: configObj },
        { bedrockObj: struct, config: config.struct }
    );

    // Lets run the tasks
    promises = [
        file.task(bedrockObj, configObj.copy, 'copy'),
        file.task(bedrockObj, configObj.rename, 'rename'),
        file.task(bedrockObj, configObj.remove, 'remove'),
        create.task(bedrockObj, configObj.create),
        sprite.task(bedrockObj, configObj.sprite),
        style.task(bedrockObj, configObj.style),
        script.task(bedrockObj, configObj.script),
        raw.task(bedrockObj, configObj.raw),
        server.task(bedrockObj, configObj.server)
    ];

    return Promise.all(promises);
}

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Initializes a module
 * @param  {string} cmd
 * @param  {string} configPath
 * @param  {string} env
 * @param  {string} sys
 */
function init(cmd, configPath, env, sys) {
    tools.setProject('project');
    tools.setModule('main');

    tools.validate.type(
        { cmd: cmd, configPath: configPath, env: env, sys: sys },
        {
            cmd: Joi.string(),
            configPath: Joi.string(),
            env: Joi.string().allow(''),
            sys: Joi.string()
        }
    );

    // Check if there is a config file and load it
    tools.setModule('config');
    config.get(configPath)
    .then(function (configObj) {
        var createOrderFn;
        var bedrockObj;
        var promise;
        var oldWd;

        // Change working dir so that paths may be relative
        oldWd = process.cwd();
        process.chdir(tools.getDir(configPath));

        // Set the order function
        createOrderFn = function (order) {
            tools.setModule('main');
            tools.log('Order: ' + order);

            // Lets create the bedrock object
            bedrockObj = { order: order, env: env, sys: sys, cmd: cmd };

            // Run the order
            return runOrder(bedrockObj, configObj)
            .then(function () {
                if (order < configObj.maxOrder) {
                    return createOrderFn(order += 1);
                }
            });
        };

        // Create a new promise
        promise = new Promise(function (resolve) {
            resolve();
        })
        .then(createOrderFn.bind(null, 0));

        // Change back the working dir
        process.chdir(oldWd);

        // Set all promises
        return promise;
        // return Promise.all(promises);
    })
    .then(function () {
        tools.setModule('main');
        tools.log('All done!');
    })
    .catch(function (err) {
        tools.setModule('main');
        tools.logErr(err);
    });
}

// -----------------------------------------
// EXPORTS

module.exports = init;
