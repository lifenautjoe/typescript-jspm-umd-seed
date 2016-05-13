#!/usr/bin/env node
/**
 * A script to adapt the jspm watching and bundling files to the karma continuous testing workflow.
 * If in the future jspm provides an api to watch files without a starting bundling job or the jspm karma plugin
 * supports per pattern watch flags this should be removed.
 */
'use strict';

var path = require('path');
var chokidar = require('chokidar');
var Promise = require('bluebird');
var KarmaServer = require('karma').Server;
var childProcessExec = require('child_process').exec;
var JspmBuilder = require('jspm').Builder;

var karmaRunnerRunCmd = 'npm run karma:runner:run';

var projectPath = path.join(__dirname,'..');

var projectBundlePath = path.join(projectPath,'storage');
var projectBundleFileName = 'bundle.js';
var projectBundleFilePath = path.join(projectBundlePath,projectBundleFileName);

var projectSourcePath = path.join(projectPath,'src');
var projectSpecsPattern = path.join(projectSourcePath,'**/*Spec.ts');
var projectSourcePattern = path.join(projectSourcePath,'**/*.ts');

var karmaConfigFile = path.join(projectPath,'karma.config.js');
var jspmConfigFile = path.join(projectPath,'jspm.config.js');

function onError(err){
    console.log(err) && process.exit(1);
}

function makeServer(configFile,onReady){
    return new Promise(function(resolve, reject){
        var resolved;
        var server = new KarmaServer({
            configFile : configFile
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
    childProcessExec(karmaRunnerRunCmd);
}

function bundlePackage(){
    var jspmBuilder = new JspmBuilder();
    return jspmBuilder.loadConfig(jspmConfigFile).then(function () {
        return jspmBuilder.bundle('typescript-jspm-umd-seed', projectBundleFilePath);
    });
}

function setSourceWatcher(){
    chokidar.watch(projectSourcePattern,{
        ignored : projectSpecsPattern
    }).on('change',function(file){
        console.info(['Source file',file,'has changed, re-bundling package'].join(' '));
        bundlePackage().catch(onError);
    });
}

function setBundleWatcher(server){
    chokidar.watch(projectBundleFilePath).on('change',function () {
        console.info('Bundle changed, re-running specs');
        server.refreshFiles().then(function(){
            runSpecs();
        }).catch(onError);
    });
}

function setSpecsWatcher(){
    chokidar.watch(projectSpecsPattern).on('change',function (file) {
        console.info(['Spec file',file,'has changed, re-running specs'].join(' '));
        runSpecs();
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