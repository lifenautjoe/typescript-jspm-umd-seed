#!/usr/bin/env node
/**
 * A CLI utility to run a karma runner run.
 * We don't use the karma runner runner export as we would need to run the karma server as a daemon in order to not
 * have duplicate logging.
 * See https://github.com/karma-runner/karma/issues/2121
 * @author Joel Hernandez <involvmnt@gmail.com>
 */
'use strict';
var cli = require('cli');
var karmaRunnerRun = require('./karma-runner-run');

cli.parse({
    hostname: ['h', 'The karma server hostname', 'string', 'localhost'],
    urlRoot: ['u', 'The url root of the karma server', 'string', '/'],
    port: ['p', 'The port of the karma server', 'int', 9876],
    failOnEmpty: ['l', 'Whether the runner should output logs', 'true', false]
});

cli.main(function (args, options) {
    karmaRunnerRun(options,cli).then(function(){
        process.exit();
    }).catch(function(error){
        cli.fatal(error);
    });
});

