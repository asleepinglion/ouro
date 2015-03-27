"use strict";

var Class = require('superjs-base');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var changeCase = require('change-case');

module.exports = Class.extend({

  //load module into local or global namespace
  loadModule: function(moduleName, options) {

    if( options.build.local ) {

      //create local modules object if it does not exist
      if( !this.modules ) {
        this.modules = {};
      }

      if( typeof this.modules[moduleName] === 'object' && !options.build.replace ) {

        //add local shortcut to the instance if requested
        if( typeof options.build.shortcut === 'string' ) {
          this[options.build.shortcut] = this.modules[moduleName];
        }

        return false;
      }

      //otherwise, mount into the global namespace
    } else {

      //create global superjs object if one does not exist
      if( !global.superjs ) {
        global.superjs = {};
      }

      //create global superjs modules object if one does not exist
      if( !global.superjs.modules ) {
        global.superjs.modules = {};
      }

      if( typeof global.superjs.modules[moduleName] === 'object' && !options.build.replace ) {

        //add local shortcut to the instance if requested
        if( typeof options.build.shortcut === 'string' ) {
          this[options.build.shortcut] = global.superjs.modules[moduleName];
        }

        return false;
      }
    }

    var instance = undefined;
    var modulePath = undefined;

    //the application path is based on the current working directory
    var appPath = process.cwd() + '/modules/superjs-' + moduleName;

    //the submodule path is based on the provided module path (always nested inside the package)
    if( options.build.subModule ) {
      options.build.subModule = path.normalize(options.build.subModule + '../../../') + 'node_modules/superjs-' + moduleName;
    }

    //the npm path points to the current working directory's node_modules
    var npmPath = process.cwd() + '/node_modules/superjs-' + moduleName;

    //if the module is part of our application
    if( fs.existsSync( modulePath ) ) {
      modulePath = appPath;

      //else if, the module path has been specified and it exists there
    } else if(options.build.subModule && fs.existsSync(options.build.subModule) ) {
      modulePath = options.build.subModule;

      //else if, the module has been installed via npm
    } else if(fs.existsSync(npmPath) ) {
      modulePath = npmPath;

    } else {
      throw new Error('The ' + moduleName + ' module could not be found!');
    }

    console.log(colors.cyan('loading module:'),modulePath);

    //require the module
    var Module = require(modulePath);

    //instantiate the module
    if( typeof Module[changeCase.pascalCase(moduleName)] === 'function' ) {
      instance = new Module[changeCase.pascalCase(moduleName)](this, options.boot);
    } else {
      instance = new Module(this, options.boot);
    }

    //if requested, mount into object namespace
    if( options.build.local ) {

      //add module to the modules list
      this.modules[moduleName] = instance;

      //otherwise, mount into the global namespace
    } else {

      //add module to the global modules list
      global.superjs.modules[moduleName] = instance;
    }

    //add local shortcut to the instance if requested
    if( typeof options.build.shortcut === 'string' ) {
      this[options.build.shortcut] = instance;
    }

    return true;

  },

  //get a module from the local or global namespace
  getModule: function(moduleName) {
    if( this[moduleName] ) {
      return this[moduleName];
    } else if( global.superjs && global.superjs.modules ) {
      return global.superjs.modules[moduleName];
    } else {
      return undefined;
    }
  }

});
