# Meteor Loader

A Meteor package which co-ordinates the supply of Meteor dependencies to npm modules at runtime

This module is part of a suite:
 - [Dependency Mapper](https://github.com/webantic/dependency-mapper)
 - [Meteor Loader (this module)](https://github.com/webantic/meteor-loader)
 - [Meteor Deps](https://github.com/webantic/meteor-deps)

## What is it?

This is a Meteor build plugin which provides your node modules with access to Meteor packages that they depend on.
It works something like:
1. Recursively scan all node modules
2. If the package.json of a given node module has a "meteorDependencies" field, it will add these dependencies to a list of package names
3. It will generate a Meteor package, which declares a dependency on all of the packages required by your node modules
4. It will require the `@webantic/meteor-deps` module of _each node module with a Meteor dependency_ and inject the dependencies to it

## Wait, what?

You can use things like `Mongo` or `FlowRouter` in your node modules.

## How??

First, clone this repo into your project's `/packages` directory and add `webantic:meteor-loader` to your package manifest in `/.meteor/packages`

Then, there are only three real hoops to jump through for this to work;

### 1. You must wrap your node module's exports:

##### es5 / commonjs
```js
var wrapExports = require('@webantic/meteor-deps').wrapExports

var moduleExports = {
  thing1: require('./thing1.js'),
  thing2: require('./thing2.js')
}

module.exports = wrapExports(module, moduleExports)
```

##### es6
```js
import { inject } from '@webantic/meteor-deps'

import thing1 from './thing1.js'
import thing2 from './thing2.js'

export {
  thing1,
  thing2,
  inject
}
```

### 2. You must access your Meteor dependencies via the @webantic/meteor-deps module:

```js
var getDep = require('@webantic/meteor-deps').get
var Meteor = getDep('Meteor')

// In some cases, you may need to access the value asynchronously, like this:
getDep('Meteor').then(function (Meteor) {
  // ...
})
```

### 3. You must declare your dependencies in your module's package.json:

```json
{
  "name": "my-cool-module",
  "version": "1.0.0",
  "dependencies": {},
  "meteorDependencies": {
    "meteor": ["client", "server"],
    "kadira:flow-router": "client"
  }
}
```
