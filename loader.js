/* globals Npm Plugin buildInjectorJs buildPackageJs */
'use strict'

if (process.env.INJECTOR_DEBUG) {
  console.log('++++ WEBANTIC:LOADER ++++')
}

const path = Plugin.path
const fs = Plugin.fs
const mkdirp = Npm.require('mkdirp')
const mapper = Npm.require('@webantic/dependency-mapper').default

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
    const dependencies = npmDependencies.dependencies
    for (const key in dependencies) {
      if (Object.keys(dependencies[key].allMeteorDependencies).length) {
        modulesWithMeteorDeps.push(key)
      }
    }

    let currentPackageJs, currentInjectorJs
    try {
      currentPackageJs = String(fs.readFileSync('packages/node-injector/package.js'))
      currentInjectorJs = String(fs.readFileSync('packages/node-injector/injector.js'))
    } catch (ex) {
      if (process.env.INJECTOR_DEBUG) {
        console.error(ex)
      }
    }
    const packageJs = buildPackageJs(npmDependencies.allMeteorDependencies)
    const injectorJs = buildInjectorJs(npmDependencies.allMeteorDependencies, modulesWithMeteorDeps)

    if (currentPackageJs !== packageJs || currentInjectorJs !== injectorJs) {
      console.log('*** Generating webantic:node-injector package ***')

      mkdirp.sync(path.resolve('packages/node-injector'))

      if (currentPackageJs !== packageJs) {
        fs.writeFileSync('packages/node-injector/package.js', packageJs)
      }

      if (currentInjectorJs !== injectorJs) {
        fs.writeFileSync('packages/node-injector/injector.js', injectorJs)
      }
    }
  }
}

if (process.env.INJECTOR_DEBUG) {
  console.log('---- WEBANTIC:LOADER ----')
}

