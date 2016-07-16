/**
 * A function to request a karma runner server to run/re-run.
 * We don't use the karma runner runner export as we would need to run the karma server as a daemon in order to not
 * have duplicate logging.
 * See https://github.com/karma-runner/karma/issues/2121
 * @author Joel Hernandez <involvmnt@gmail.com>
 */
'use strict';
var Promise = require('bluebird');
var http = require('http');

var EXIT_CODE = '\x1FEXIT';

function parseExitCode(buffer, defaultCode, failOnEmptyTestSuite, logger) {
    var tailPos = buffer.length - Buffer.byteLength(EXIT_CODE) - 2;

    if (tailPos < 0) {
        return {exitCode: defaultCode, buffer: buffer}
    }
    var tail = buffer.slice(tailPos);
    var tailStr = tail.toString();
    if (tailStr.substr(0, tailStr.length - 2) === EXIT_CODE) {
        var emptyInt = parseInt(tailStr.substr(-2, 1), 10);
        var exitCode = parseInt(tailStr.substr(-1), 10);
        if (failOnEmptyTestSuite === false && emptyInt === 0) {
            logger.info('Test suite was empty.');
            exitCode = 0
        }
        return {exitCode: exitCode, buffer: buffer.slice(0, tailPos)}
    }

    return {exitCode: defaultCode, buffer: buffer}
}

module.exports = function karmaRunnerRun(options) {

    if(!options) return Promise.reject(new Error('options argument not given'));
    if(!options.hostname) return Promise.reject(new Error('options.hostname argument not given'));
    if(!options.urlRoot) return Promise.reject(new Error('options.urlRoot argument not given'));
    if(!options.port) return Promise.reject(new Error('options.port argument not given'));

    var logger = options.logger || console;

    return new Promise(function (resolve, reject) {
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

            var resultMessage;
            response.on('data', function (buffer) {
                var parsedResult = parseExitCode(buffer, exitCode, options.failOnEmpty, logger);
                exitCode = parsedResult.exitCode;
            });

            response.on('end', function () {
                resolve(resultMessage);
                //exitCode ? reject(new Error(resultMessage)) : resolve(resultMessage);
            })
        });

        request.on('error', function (e) {
            e.code === 'ECONNREFUSED' ? reject(new Error('There is no server listening on port ' + options.port)) : reject(e);
        });

        request.end();
    });
};
