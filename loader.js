/* globals Npm Plugin buildInjectorJs buildPackageJs */
'use strict'

class Loader {
  constructor () {
    this.path = Plugin.path
    this.fs = Plugin.fs
    this.mkdirp = Npm.require('mkdirp')
  }

  log (message) {
    if (process.env.INJECTOR_DEBUG) {
      console.log(message)
    }
  }
  
  error (message) {
    if (process.env.INJECTOR_DEBUG) {
      console.error(message)
    }
  }

  ensureInjectorPresent () {
    // Ensure the webantic:node-injector package is included
    const packagesPath = '.meteor/packages'
    let currentPackagesManifest = String(this.fs.readFileSync(packagesPath))
    
    const regExp = new RegExp(/^( *)webantic:node-injector/m)
    if (!regExp.test(currentPackagesManifest)) {
      currentPackagesManifest += '\nwebantic:node-injector\n'
      this.fs.writeFileSync(packagesPath, currentPackagesManifest)
    }
  }

  process () {
    this.log('++++ WEBANTIC:LOADER ++++')

    const mapper = Npm.require('@webantic/dependency-mapper').default
    
    let npmDeps = mapper(process.cwd())
    const thisAppName = Object.keys(npmDeps)[0]
    npmDeps = npmDeps[thisAppName]

    const meteorDeps = npmDeps ? npmDeps.allMeteorDependencies : {}

    // If there are any Meteor deps
    if (Object.keys(meteorDeps).length) {
      this.ensureInjectorPresent(process.cwd())

      // If the mapper failed, thisAppName will be missing or === "default"
      if (thisAppName && thisAppName !== 'default') {
        const modulesWithMeteorDeps = []
        const dependencies = npmDeps.dependencies

        for (const key in dependencies) {
          if (Object.keys(dependencies[key].allMeteorDependencies).length) {
            modulesWithMeteorDeps.push(key)
          }
        }

        const packageJsPath = 'packages/node-injector/package.js'
        const injectorJsPath = 'packages/node-injector/injector.js'

        let currentPackageJs, currentInjectorJs
        try {
          currentPackageJs = String(this.fs.readFileSync(packageJsPath))
          currentInjectorJs = String(this.fs.readFileSync(injectorJsPath))
        } catch (ex) {
          this.error(ex.message)
        }

        const packageJs = buildPackageJs(meteorDeps)
        const injectorJs = buildInjectorJs(meteorDeps, modulesWithMeteorDeps)
    
        if (currentPackageJs !== packageJs || currentInjectorJs !== injectorJs) {
          console.log('\n*** Generating webantic:node-injector package ***')
    
          this.mkdirp.sync('packages/node-injector')
    
          if (currentPackageJs !== packageJs) {
            this.fs.writeFileSync(packageJsPath, packageJs)
          }
    
          if (currentInjectorJs !== injectorJs) {
            this.fs.writeFileSync(injectorJsPath, injectorJs)
          }
        }
      }
    }
    
    this.log('---- WEBANTIC:LOADER ----')
  }
}

var loader = new Loader()
loader.process()
