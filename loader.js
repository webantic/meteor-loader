/* globals Npm Plugin buildInjectorJs buildPackageJs */

if (process.env.INJECTOR_DEBUG) {
  console.log('++++ WEBANTIC:LOADER ++++')
}

const path = Plugin.path
const fs = Plugin.fs
const mkdirp = Npm.require('mkdirp')
const mapper = Npm.require('@webantic/dependency-mapper')

let npmDependencies = mapper(process.cwd())
const thisModuleName = Object.keys(npmDependencies)[0]
npmDependencies = npmDependencies[thisModuleName]

// If there are any Meteor deps
if (Object.keys(npmDependencies.allMeteorDependencies).length) {
  // Ensure the webantic:node-injector package is included
  let currentPackagesManifest = String(fs.readFileSync('.meteor/packages'))
  if (currentPackagesManifest.indexOf('webantic:node-injector') === -1) {
    currentPackagesManifest += '\nwebantic:node-injector\n'
    fs.writeFileSync('.meteor/packages', currentPackagesManifest)
  }

  // If the mapper failed, thisModuleName will be missing or === "default"
  if (thisModuleName && thisModuleName !== 'default') {
    const modulesWithMeteorDeps = []
    const { dependencies } = npmDependencies
    for (const key in dependencies) {
      if (Object.keys(dependencies[key].allMeteorDependencies).length) {
        modulesWithMeteorDeps.push(key)
      }
    }

    console.log('*** Generating webantic:node-injector package ***')

    mkdirp.sync(path.resolve('packages/node-injector'))

    const packageJs = buildPackageJs(npmDependencies.allMeteorDependencies)
    fs.writeFileSync('packages/node-injector/package.js', packageJs)

    const injectorJs = buildInjectorJs(npmDependencies.allMeteorDependencies, modulesWithMeteorDeps)
    fs.writeFileSync('packages/node-injector/injector.js', injectorJs)
  }
}

if (process.env.INJECTOR_DEBUG) {
  console.log('---- WEBANTIC:LOADER ----')
}
