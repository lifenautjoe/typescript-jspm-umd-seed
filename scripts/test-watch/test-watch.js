#!/usr/bin/env node
/**
 * A module to integrate the jspm watching and bundling files to the karma continuous testing workflow.
 * If in the future jspm provides an api to watch files without a starting bundling job or the jspm karma plugin
 * supports per pattern watch flags this should be removed.
 *
 * Briefly explained :
 * 1.- Creates a bundle for the given bundlePackageName
 * 2.- Makes a karma server
 * 3.- Watches over the created bundle and on change triggers a new test execution
 * 4.- Watches over the given testsStc and on change triggers a new test execution
 * 5.- Watches over the given bundleSrc and on change re-bundles, which results in triggering step 3
 *
 * @author Joel Hernandez <involvmnt@gmail.com>
 */
'use strict';

var path = require('path');
var chokidar = require('chokidar');
var KarmaServer = require('karma').Server;
var JspmBuilder = require('jspm').Builder;
var karmaRunnerRun = require('./../karma-runner-run/karma-runner-run');
var Promise = require('bluebird');

/**
 * @param {Object} options
 * @param {string} options.karmaRunnerConfig
 * @param {string} options.bundleDest
 * @param {string} options.bundlePackage
 * @param {string} options.bundleSrc
 * @param {string} options.testsSrc
 * @param {string} [options.logger]
 * @param{string} options.hostname
 * @param{string} options.urlRoot
 * @param{number} options.port
 * @param{boolean} options.failOnEmptyTestSuite
 */
module.exports = function (options) {
    var logger = options.logger || console;

    function onError(err) {
        logger.error(err) && process.exit(1);
    }

    function makeServer(options, onReady) {
        return new Promise(function (resolve, reject) {
            var resolved;
            var server = new KarmaServer({
                configFile: options.karmaRunnerConfig
            }, function (exitCode) {
                reject('Karma has exited with ' + exitCode);
            });

            server.on('browsers_ready', function () {
                // There is no server_ready event..
                if (!resolved) {
                    resolve(server);
                    resolved = true;
                }
                onReady();
            });

            server.start();
        });
    }

    function runSpecs(options) {
        karmaRunnerRun(options);
    }

    function bundlePackage(options) {
        var jspmBuilder = new JspmBuilder();
        return jspmBuilder.loadConfig(options.jspmConfig).then(function () {
            return jspmBuilder.bundle(options.bundlePackage, options.bundleDest);
        });
    }

    function setSourceWatcher(options) {
        chokidar.watch(options.bundleSrc, {
            ignored: options.testsSrc
        }).on('change', function (file) {
            logger.info(['Source file', file, 'has changed, re-bundling package'].join(' '));
            bundlePackage(options).catch(onError);
        });
    }

    function setBundleWatcher(server, options) {
        chokidar.watch(options.bundleDest).on('change', function () {
            logger.info('Bundle changed, re-running specs');
            server.refreshFiles().then(function () {
                runSpecs(options);
            }).catch(onError);
        });
    }

    function setSpecsWatcher(options) {
        chokidar.watch(options.testsSrc).on('change', function (file) {
            logger.info(['Spec file', file, 'has changed, re-running specs'].join(' '));
            runSpecs(options);
        });
    }

    function setWatchers(server, options) {
        setBundleWatcher(server, options);
        setSpecsWatcher(options);
        setSourceWatcher(options);
    }

    bundlePackage(options).then(function () {
        return makeServer(options, runSpecs);
    }).then(function (server) {
        setWatchers(server, options);
    }).catch(onError);
};
