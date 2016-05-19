#!/usr/bin/env node
/**
 * A CLI utility to integrate the jspm watching and bundling files to the karma continuous testing workflow.
 * If in the future jspm provides an api to watch files without a starting bundling job or the jspm karma plugin
 * supports per pattern watch flags this should be removed.
 * @author Joel Hernandez <involvmnt@gmail.com>
 */
'use strict';

var path = require('path');
var chokidar = require('chokidar');
var Promise = require('bluebird');
var KarmaServer = require('karma').Server;
var JspmBuilder = require('jspm').Builder;
var karmaRunnerRun = require('./../karma-runner-run/karma-runner-run');

module.exports = function (options) {

    var logger = options.logger || console;
    var src = options.src;
    var srcExclude = options.srcExclude;
    var specs = options.specs;
    var specsExclude = options.specsExclude;
    var bundleDest = options.bundleDest;
    var karmaConfigFile = options.karmaConfigFile;
    var jspmConfigFile = options.jspmConfigFile;
    var hostname = options.hostname;
    var urlRoot = options.urlRoot;
    var port = options.port;
    var failOnEmptyTestSuite = options.failOnEmptyTestSuite;
    var karmaRunnerRunConfig = {
        hostname: hostname,
        urlRoot: urlRoot,
        port: port,
        failOnEmptyTestSuite: failOnEmptyTestSuite
    };

    function onError(err) {
        logger.error(err) && process.exit(1);
    }

    function makeServer(configFile, onReady) {
        return new Promise(function (resolve, reject) {
            var resolved;
            var server = new KarmaServer({
                configFile: configFile,
                hostname: hostname,
                urlRoot: urlRoot,
                port: port,
                failOnEmptyTestSuite: failOnEmptyTestSuite
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

    function runSpecs() {
        return karmaRunnerRun(karmaRunnerRunConfig, cli);
    }

    function bundlePackage() {
        var jspmBuilder = new JspmBuilder();
        return jspmBuilder.loadConfig(jspmConfigFile).then(function () {
            return jspmBuilder.bundle('typescript-jspm-umd-seed', bundleDest);
        });
    }

    function setSourceWatcher() {
        chokidar.watch(src, {
            ignored: srcExclude
        }).on('change', function (file) {
            logger.info(['Source file', file, 'has changed, re-bundling package'].join(' '));
            bundlePackage().catch(onError);
        });
    }

    function setBundleWatcher(server) {
        chokidar.watch(bundleDest).on('change', function () {
            logger.info('Bundle changed, re-running specs');
            server.refreshFiles().then(function () {
                return runSpecs();
            }).catch(onError);
        });
    }

    function setSpecsWatcher() {
        chokidar.watch(specs, {
            ignored: specsExclude
        }).on('change', function (file) {
            logger.info(['Spec file', file, 'has changed, re-running specs'].join(' '));
            runSpecs().catch(onError);
        });
    }

    function setWatchers(server) {
        setBundleWatcher(server);
        setSpecsWatcher();
        setSourceWatcher();
    }

    bundlePackage().then(function () {
        return makeServer(karmaConfigFile, runSpecs);
    }).then(function (server) {
        setWatchers(server);
    }).catch(onError);
};
