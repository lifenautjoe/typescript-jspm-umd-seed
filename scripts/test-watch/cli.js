/**
 * @author Joel Hernandez <involvmnt@gmail.com>
 */
'use strict';
var cli = require('cli');
var testWatch = require('./test-watch');

cli.parse({
    // e.g. ./karma.config.js
    jspmConfig: ['j', 'The path to the jspm configuration file', 'string'],
    // e.g. ./karma.config.js
    karmaRunnerConfig: ['c', 'The path to the karma runner configuration file', 'string'],
    // e.g. ./storage/bundle.js
    bundleDest: ['b', 'The destination of the bundle to create and watch upon for test triggers', 'string'],
    // e.g. typescript-jspm-umd-seed
    bundlePackage: ['p', 'The package in the jspm config file to bundle which path should match the given bundleSrc', 'string'],
    // e.g. ./src/**/*.ts
    bundleSrc: ['s', 'The source of the bundle', 'string'],
    // e.g. ./src/**/*Spec.ts
    testsSrc: ['t', 'The test/s to run', 'string'],
    // e.g. localhost
    hostname: ['h', 'The karma server hostname', 'string', 'localhost'],
    // e.g. /
    urlRoot: ['u', 'The karma server url root', 'string', '/'],
    // e.g. 8080
    port: ['p', 'The karma server port', 'int', 9876],
    // e.g. true
    failOnEmptyTestSuite: ['f', 'Whether the process should exit on empty specs', 'true', false]
});

cli.main(function (args, options) {
    testWatch(options).catch(function (err) {
        cli.fatal(err);
    });
});