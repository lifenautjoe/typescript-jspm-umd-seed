'use strict';

module.exports = function (config) {
    config.set({
        // Restart karma as soon as a change is detected
        restartOnFileChange : true,
        // Do not auto watch files
        autoWatch : false,
        // The browsers to be spawned by karma
        browsers : [
            'PhantomJS'
        ],
        // The reporters to be used by karma
        reporters : [
          'progress'
        ],
        // The frameworks employed by karma
        frameworks: [
            'jspm',
            'jasmine'
        ],
        // karma-jspm plugin bug fix
        proxies: {
            '/src/': '/base/src/',
            '/jspm_packages/': '/base/jspm_packages/',
            '/typings/': '/base/typings/',
            '/storage/': '/base/storage/',
            "/tsconfig.json": "/base/tsconfig.json"
        },
        // karma-jspm plugin configuration
        jspm: {
            // Whether to use existing jspm bundles (faster loading)
            useBundles: true,
            // The jspm browser config file
            browser: "jspm.browser.js",
            // The jspm config file
            config: "jspm.config.js",
            // The files to be loaded by jspm
            loadFiles: [
                'src/main.ts',
                'src/**/*Spec.ts'
            ],
            // The files to be available to jspm but not loaded
            serveFiles: [
                'src/**/*.+(ts)',
                'storage/**/*.*',
                'typings/**/*.*',
                "tsconfig.json"
            ]
        },
        // The files to be loaded in the page before jspm's
        files : []
    });
};