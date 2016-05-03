# typescript-jspm-umd-seed
[![Build Status](https://travis-ci.org/thefabulousdev/typescript-jspm-umd-seed.svg?branch=master)](https://travis-ci.org/thefabulousdev/typescript-jspm-umd-seed)

A seed to create [UMD](https://github.com/umdjs/umd) [TypeScript](https://www.typescriptlang.org/) modules with [jspm](http://jspm.io/).

## Main features

* Automatic generation of single type declarations file
* Write your tests in TypeScript
* Playground server

*NOTE: It's mentioned as playground and not development server as I encourage you to build your library on a [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) or [TDD](https://en.wikipedia.org/wiki/Test-driven_development) approach, where you would be using the npm script `npm run test:watch` all of the time.*

## Stack

* [jspm](http://jspm.io/)
* [TypeScript](https://www.typescriptlang.org/)
* [tslint](https://github.com/palantir/tslint)
* [Jasmine](https://jasmine.github.io/)
* [Karma](https://karma-runner.github.io)
* [BrowserSync](https://www.browsersync.io/)
* [dts-generator](https://github.com/SitePen/dts-generator)
* [typings](https://github.com/typings/typings)

## Usage

#### Clone the repository

``` sh
git clone https://github.com/thefabulousdev/typescript-jspm-umd-seed.git
```

#### Install dependencies

``` sh
npm install
```

#### Use npm scripts

* `npm run jspm` to access the jspm cli
* `npm run typings` to access the typings cli
* `npm run lint` to lint the library
* `npm run lint:watch` to lint the library on watch mode
* `npm run test` to test the library
* `npm run test:watch` to test the library on watch mode
* `npm run serve:dev` to launch a server on the source files
* `npm run serve:dist` to launch a server with the optimized source files
* `npm run build` to build the library in `/dist`

#### Author: [Joel Hernández](https://github.com/thefabulousdev)

