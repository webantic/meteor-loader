/* global buildPackageJs:true */

buildPackageJs = function buildPackageJs (deps) {
  var str = `'use strict'\n\n`

  str += `Package.describe({\n`
  str += `  name: 'webantic:node-injector',\n`
  str += `  version: '1.0.0',\n`
  str += `  summary: 'A package to inject Meteor dependencies into node modules'\n`
  str += `})\n\n`

  str += `Package.onUse(function onUse (api) {\n`
  str += `  api.use('ecmascript')\n`
  for (var key in deps) {
    str += `  api.use('${key.toLowerCase()}', ${JSON.stringify(deps[key])})\n`
  }
  str += `\n  api.mainModule('injector.js')\n`
  str += `})`

  return str
}
