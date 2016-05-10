#!/usr/bin/env node
/**
 * A CLI utility to run a karma runner run.
 * We don't use the karma runner runner export as we would need to run the karma server as a daemon in order to not
 * have duplicate logging.
 * See https://github.com/karma-runner/karma/issues/2121
 */

var cli = require('cli');
var http = require('http');

cli.parse({
    hostname: ['h', 'The karma server hostname', 'string', 'localhost'],
    urlRoot: ['u', 'The url root of the karma server', 'string', '/'],
    port: ['p', 'The port of the karma server', 'int', 9876],
    logs: ['l', 'Whether the runner should output logs', 'true', false],
    failOnEmpty: ['l', 'Whether the runner should output logs', 'true', false]
});

var EXIT_CODE = '\x1FEXIT';

function parseExitCode(buffer, defaultCode, failOnEmptyTestSuite) {
    var tailPos = buffer.length - Buffer.byteLength(EXIT_CODE) - 2;

    if (tailPos < 0) {
        return {exitCode: defaultCode, buffer: buffer}
    }

    // tail buffer which might contain the message
    var tail = buffer.slice(tailPos);
    var tailStr = tail.toString();
    if (tailStr.substr(0, tailStr.length - 2) === EXIT_CODE) {
        var emptyInt = parseInt(tailStr.substr(-2, 1), 10);
        var exitCode = parseInt(tailStr.substr(-1), 10);
        if (failOnEmptyTestSuite === false && emptyInt === 0) {
            cli.info('Test suite was empty.');
            exitCode = 0
        }
        return {exitCode: exitCode, buffer: buffer.slice(0, tailPos)}
    }

    return {exitCode: defaultCode, buffer: buffer}
}

cli.main(function (args, options) {

    var exitCode;

    var requestOptions = {
        hostname: options.hostname,
        path: options.urlRoot + 'run',
        port: options.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var request = http.request(requestOptions, function (response) {
        response.on('data', function (buffer) {
            var parsedResult = parseExitCode(buffer, exitCode, options.failOnEmpty);
            exitCode = parsedResult.exitCode;
            if (options.logs) cli.info(parsedResult.buffer);
            process.exit(exitCode);
        });

        response.on('end', function () {
            process.exit(exitCode);
        })
    });

    request.on('error', function (e) {
        if (e.code === 'ECONNREFUSED') {
            cli.fatal('There is no server listening on port ' + options.port);
        } else {
            throw e;
        }
    });

    request.end();
});

