"use strict";

var SuperJS = require('../../index');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var merge = require('recursive-merge');
var util = require('util');

module.exports = SuperJS.Class.extend({

  _metaFile: function() {
    this._super();
    this._loadMeta(__filename);
  },

  //initialize the application
  init: function(options) {

    this._super();

    //maintain the build schedule
    this.buildSchedule = [];

    //execute the before build hook
    this.beforeBuild();

    //execute the build hook
    this.build();

    //execute the after build hook
    this.afterBuild();

    //execute before boot hook
    this.beforeBoot();

    //execute the boot hook
    this.boot();

    //execute after boot hook
    this.afterBoot();

    //execute ready hook
    this.emit('ready');
    this.ready();
  },

  //before build hook
  beforeBuild: function() {

  },

  //add modules to the build schedule
  build: function() {
    throw new SuperJS.Error('missing_build', 'The build process must be defined with modules to schedule for boot.');
  },

  //schedule module to be loaded during the boot process
  schedule: function(moduleName, options) {

    //set default the options object
    if( typeof options === 'object' ) {

      options.build = (typeof options.build === 'object' ) ? options.build : {};
      options.boot = (typeof options.boot === 'object' ) ? options.boot : {};

    } else {

      options = {};
      options.build = {};
      options.boot = {};

    }

    //if the module has been added already, lets merge the options
    for( var i = 0; i < this.buildSchedule.length; i++ ) {

      var module = this.buildSchedule[i];

      if( module.name === moduleName ) {

        if( typeof module.options === 'object' ) {
          module.options = merge(options, module.options);
        } else {
          module.options = options;
        }

        break;
      }
    }

    //add the module to the build schedule
    this.buildSchedule.push( {name: moduleName, options: options } );

  },

  //after build hook
  afterBuild: function() {

  },

  //before boot hook
  beforeBoot: function() {

  },

  //load & configure modules
  boot: function() {

    //start the load process for each module
    for( var i = 0; i < this.buildSchedule.length; i++ ) {

      var module = this.buildSchedule[i];

      if( typeof module.options.build.before === 'function' ) {
        module.options.build.before();
      }

      //load the actual module
      this.loadModule(module.name, module.options);

      if( typeof module.options.build.after === 'function' ) {
        module.options.build.after();
      }

    }

  },

  //after boot hook
  afterBoot: function() {

  },

  //start our application
  ready: function() {

  }

});
