/**
 * @author Joel Hernandez <involvmnt@gmail.com>
 */
'use strict';
var cli = require('cli');
var testWatch = require('./test-watch');

cli.parse({
    src: ['A glob pattern to match source files which trigger a run on changed', 'string'],
    srcExclude: ['A glob pattern to exclude source files', 'string'],
    specs: ['A glob pattern to match specification files which trigger a run on changed', 'string'],
    specsExclude: ['A glob pattern to exclude specification files', 'string'],
    bundleDest: ['The destination of the generated bundle', 'string'],
    karmaConfigFile: ['The karma configuration file within the project directory', 'string', 'karma.config.js'],
    jspmConfigFile: ['The jspm configuration file within the project directory', 'jspm.config.js'],
    hostname: ['h', 'The karma server hostname', 'string', 'localhost'],
    urlRoot: ['u', 'The karma server url root', 'string', '/'],
    port: ['p', 'The karma server port', 'int', 9876],
    failOnEmptyTestSuite: ['f', 'Whether the process should exit on empty specs', 'true', false]
});

cli.main(function (args, options) {
    testWatch(options);
});
