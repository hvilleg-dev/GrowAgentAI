#!/usr/bin/env node

// Register tsconfig-paths before requiring anything else
require('tsconfig-paths').register({
  baseUrl: __dirname,
  paths: {
    '@/*': ['dist/*'],
    '@types/*': ['dist/types/*'],
    '@errors/*': ['dist/errors/*'],
    '@constants/*': ['dist/constants/*'],
    '@utils/*': ['dist/utils/*'],
    '@services/*': ['dist/services/*'],
    '@database/*': ['dist/database/*'],
    '@routes/*': ['dist/routes/*'],
    '@middleware/*': ['dist/middleware/*'],
    '@controllers/*': ['dist/controllers/*']
  }
});

// Now require the app
require('./dist/app.js');
