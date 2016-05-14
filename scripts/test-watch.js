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
var cli = require('cli');
var karmaRunnerRun = require('./karma-runner-run/karma-runner-run');

cli.parse({
    src: ['A glob pattern to match source files which trigger a run on changed', 'string'],
    srcExclude: ['A glob pattern to exclude source files','string'],
    specs: ['A glob pattern to match specification files which trigger a run on changed', 'string'],
    specsExclude: ['A glob pattern to exclude specification files','string'],
    bundleDest: ['The destination of the generated bundle', 'string'],
    karmaConfigFile : ['The karma configuration file within the project directory','string','karma.config.js'],
    jspmConfigFile : ['The jspm configuration file within the project directory','jspm.config.js'],
    hostname: ['h', 'The karma server hostname', 'string', 'localhost'],
    urlRoot: ['u', 'The karma server url root', 'string', '/'],
    port: ['p', 'The karma server port', 'int', 9876],
    failOnEmptyTestSuite: ['f', 'Whether the process should exit on empty specs', 'true', false]
});


cli.main(function (args, options) {

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
        hostname : hostname,
        urlRoot : urlRoot,
        port : port,
        failOnEmptyTestSuite : failOnEmptyTestSuite
    };

    function onError(err){
        cli.fatal(err);
    }

    function makeServer(configFile,onReady){
        return new Promise(function(resolve, reject){
            var resolved;
            var server = new KarmaServer({
                configFile : configFile,
                hostname : hostname,
                urlRoot : urlRoot,
                port : port,
                failOnEmptyTestSuite : failOnEmptyTestSuite
            }, function(exitCode) {
                reject('Karma has exited with ' + exitCode);
            });

            server.on('browsers_ready',function () {
                // There is no server_ready event..
                if(!resolved) {
                    resolve(server);
                    resolved = true;
                }
                onReady();
            });

            server.start();
        });
    }

    function runSpecs(){
        return karmaRunnerRun(karmaRunnerRunConfig,cli);
    }

    function bundlePackage(){
        var jspmBuilder = new JspmBuilder();
        return jspmBuilder.loadConfig(jspmConfigFile).then(function () {
            return jspmBuilder.bundle('typescript-jspm-umd-seed', bundleDest);
        });
    }

    function setSourceWatcher(){
        chokidar.watch(src,{
            ignored : srcExclude
        }).on('change',function(file){
            cli.info(['Source file',file,'has changed, re-bundling package'].join(' '));
            bundlePackage().catch(onError);
        });
    }

    function setBundleWatcher(server){
        chokidar.watch(bundleDest).on('change',function () {
            cli.info('Bundle changed, re-running specs');
            server.refreshFiles().then(function(){
                return runSpecs();
            }).catch(onError);
        });
    }

    function setSpecsWatcher(){
        chokidar.watch(specs,{
            ignored : specsExclude
        }).on('change',function (file) {
            cli.info(['Spec file',file,'has changed, re-running specs'].join(' '));
            runSpecs().catch(onError);
        });
    }

    function setWatchers(server){
        setBundleWatcher(server);
        setSpecsWatcher();
        setSourceWatcher();
    }

    bundlePackage().then(function() {
        return makeServer(karmaConfigFile,runSpecs);
    }).then(function(server){
        setWatchers(server);
    }).catch(onError);
});
