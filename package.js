/* global Package */
'use strict'

Package.describe({
  name: 'webantic:loader',
  version: '1.0.1',
  summary: 'A Meteor dependency loader',
  git: 'https://github.com/webantic/meteor-loader',
  documentation: 'README.md'
})

Package.registerBuildPlugin({
  name: 'loader',
  sources: ['buildPackage.js', 'buildInjector.js', 'loader.js'],
  npmDependencies: {
    '@webantic/dependency-mapper': '1.1.9',
    'mkdirp': '0.5.1'
  }
})
