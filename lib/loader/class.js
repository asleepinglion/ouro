"use strict";

var Class = require('superjs-base');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var changeCase = require('change-case');
var path = require('path');

module.exports = Class.extend({

  //convert class path to a module path
  _modulePath: function(classPath) {
    return path.resolve(classPath+'/../../');
  },

  //load class into local or global namespace
  _load: function(className, options) {

    //default the namespace for mounting classes
    options.setup.namespace = options.setup.namespace || 'classes';

    //default the module prefix
    options.setup.modulePrefix = options.setup.modulePrefix = 'superjs-';

    //default the module to the the class name
    options.setup.module = options.setup.module || className;

    //default the module path
    options.setup.modulePath = options.setup.modulePath || process.cwd();

    //default the class directory
    options.setup.classDir = options.setup.dir || 'lib';

    //default the class file
    options.setup.classFile = options.setup.classFile || 'class.js';

    if( options.setup.local ) {

      //create local namespace object if it does not exist
      if( typeof this[options.setup.namespace] !== 'object' ) {
        this[options.setup.namespace] = {};
      }

      //if class already loaded and the replace option is not true, just add the shortcut
      if( typeof this.classes[className] === 'object' && !options.setup.replace ) {

        //add local shortcut to the instance if requested
        if( typeof options.setup.shortcut === 'string' ) {
          this[options.setup.shortcut] = this.classes[className];
        }

        return false;
      }

      //otherwise, mount into the global namespace
    } else {

      //create global superjs object if one does not exist
      if( !global.superjs ) {
        global.superjs = {};
      }

      //create global namespace object if it does not exist
      if( typeof global.superjs[options.setup.namespace] !== 'object' ) {
        global.superjs[options.setup.namespace] = {};
      }

      if( typeof global.superjs.classes[className] === 'object' && !options.setup.replace ) {

        //add local shortcut to the instance if requested
        if( typeof options.setup.shortcut === 'string' ) {
          this[options.setup.shortcut] = global.superjs.classes[className];
        }

        return false;
      }
    }

    //setup the class path
    var classPath = options.setup.modulePath + '/' + options.setup.classDir + '/' + className + '/' + options.setup.classFile;

    //setup the node module class path
    var npmClassPath = options.setup.modulePath + '/node_modules/' + options.setup.modulePrefix + options.setup.module + '/' + options.setup.classDir + '/' + className + '/' + options.setup.classFile;

    if( fs.existsSync( classPath ) ) {

      //if the module path exists continue with that path

    } else if( fs.existsSync(npmClassPath ) ) {

      //use the node module path if it exists there
      classPath = npmClassPath;

    } else {

      console.log(colors.yellow('missing class:'), options.setup);
      return false;
    }

    //console.log(colors.cyan('loading class:'), classPath);

    //require the class
    var Class = require(classPath);

    //instantiate the class
    var instance = new Class(this, options.boot);

    //if requested, mount into object namespace
    if( options.setup.local ) {

      //add class to the classes list
      this[options.setup.namespace][className] = instance;

    //otherwise, mount into the global namespace
    } else {

      //add class to the global classes list
      global.superjs[options.setup.namespace][className] = instance;
    }

    //add local shortcut to the instance if requested
    if( typeof options.setup.shortcut === 'string' ) {

      this[options.setup.shortcut] = instance;
    }

    return true;

  },

  //get a class from a local or global namespace
  _class: function(className, namespace) {

    namespace = namespace || 'classes';

    if( this[namespace] && this[namespace][className] ) {
      return this[namespace][className];
    } else if( global.superjs && global.superjs[namespace] && global.superjs[namespace][className] ) {
      return global.superjs[namespace][className];
    } else {
      return undefined;
    }
  }

});
