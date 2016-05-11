#!/usr/bin/env node
/**
 * A script to adapt the jspm watching and bundling files to the karma continuous testing workflow.
 * If in the future jspm provides an api to watch files without a starting bundling job or the jspm karma plugin
 * supports per pattern customization this should be removed.
 */
'use strict';

var path = require('path');
var KarmaServer = require('karma').Server;
var childProcessExec = require('child_process').exec;

var karmaRunnerRunCmd = 'npm run karma:runner:run';
var jspmBundleCmd = 'npm run bundle:dev';
var jspmBundleWatchCmd = 'bundle:dev:watch';

var projectPath = path.join(__dirname,'..');
var karmaConfigFile = path.join(projectPath,'karma.config.js');

function onExecStderr(stderr){
    console.log('stderr: ' + stderr);
}

function onExeStdout(stdout){
    console.log('stdout: ' + stdout);
}

function onExecError(error){
    console.log('error: ' + error) && process.exit(error);
}

function handleExecArgs(error,stdout,stderr){
    if(stderr) onExecStderr(stderr);
    if(stdout) onExeStdout(stdout);
    if(error) onExecError(error);
}

function runTests(){
    childProcessExec(karmaRunnerRunCmd);
}

childProcessExec(jspmBundleCmd, function() {
    handleExecArgs.apply(null,arguments);

    var server = new KarmaServer({
        configFile : karmaConfigFile
    }, function(exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode)
    });

    server.on('browsers_ready',function () {
        runTests();
    });

    server.start();
});