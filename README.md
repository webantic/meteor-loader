# Meteor Loader

## What is it?

This is a Meteor build plugin which provides your node modules with access to Meteor packages that they depend on.
It works something like:
1. Recursively scan all node modules with names starting with "@webantic/"
2. If the package.json of a given node module has a "meteorDependencies" field, it will add these dependencies to a list of package names
3. It will generate a Meteor package, which declares a dependency on all of the packages required by your node modules
4. It will require the `@webantic/meteor-deps` module of _each node module with a Meteor dependency_ and inject the dependencies to it

## Wait, what?

You can use things like `Mongo` or `FlowRouter` in your node modules.

## How??

There are two main hoops to jump through for this to work;

### 1. You must wrap your node module's exports:

##### es5 / commonjs
```js
var wrapExports = require('@webantic/meteor-deps').wrapExports

var moduleExports = {
  thing1: require('./thing1.js),
  thing2: require('./thing2.js)
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

### 2. You must access your Meteor dependencies via the @webantic/meteor-deps module

```js
var meteorRequire = require('@webantic/meteor-deps').get
var Meteor = meteorRequire('Meteor')

// In some cases, you may need to access the value asynchronously, like this:
meteorRequire('Meteor', function (Meteor) {
  // ...
})

// or:
meteorRequire('Meteor').then(function (Meteor) {
  // ...
})

// The second approach opens the possibility of wrapping your module in a self-invoking anonymous async function
```