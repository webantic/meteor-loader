/* global buildInjectorJs:true */

buildInjectorJs = function buildInjectorJs (deps, moduleNames) {
  var str = `const deps = {}\n\n`

  var i = 0
  for (var key in deps) {
    if (
      (deps[key].indexOf('client') !== -1 && deps[key].indexOf('server') !== -1) ||
      (deps[key].indexOf('client') === -1 && deps[key].indexOf('server') === -1)
    ) {
      str += `import * as dep_${i} from 'meteor/${key.toLowerCase()}'\n`
      str += `deps = Object.assign(deps, dep_${i})\n\n`
    } else {
      var locus = deps[key].indexOf('client') !== -1
        ? 'Client'
        : 'Server'

      str += `if (Meteor.is${locus}) {\n`
      str += `  import * as dep_${i} from 'meteor/${key.toLowerCase()}'\n`
      str += `  deps = Object.assign(deps, dep_${i})\n`
      str += `}\n\n`
    }

    i++
  }

  for (var moduleName of moduleNames) {
    str += `try {\n`
    str += `  const { inject: inject_${i} } = require('${moduleName}/node_modules/@webantic/meteor-deps')\n`
    str += `  inject_${i} && inject_${i}(deps)\n`
    str += `} catch (ex) {\n`
    str += `  if (process.env.INJECTOR_DEBUG) {\n`
    str += `    console.error(ex)\n`
    str += `  }\n`
    str += `}\n\n`

    i++
  }

  return str
}
