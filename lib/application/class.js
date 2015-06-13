"use strict";

var Ouro = require('../../index');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var merge = require('recursive-merge');
var util = require('util');

module.exports = Ouro.Class.extend({

  _metaFile: function() {
    this._super();
    this._loadMeta(__filename);
  },

  //initialize the application
  init: function() {

    this._super.apply(this, arguments);

    //maintain the setup schedule
    this.bootSchedule = [];

    //execute the before setup hook
    this.beforeSetup();

    //execute the setup hook
    this.setup();

    //execute the after setup hook
    this.afterSetup();

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

  //before setup hook
  beforeSetup: function() {
  },

  //add modules to the boot schedule
  setup: function() {
    throw new Ouro.Error('missing_setup', 'The setup process must be defined with modules to schedule for boot.');
  },

  //schedule class to be loaded during the boot process
  schedule: function(className, options) {

    //set default the options object
    if( typeof options === 'object' ) {

      options.setup = (typeof options.setup === 'object' ) ? options.setup : {};
      options.boot = (typeof options.boot === 'object' ) ? options.boot : {};

    } else {

      options = {};
      options.setup = {};
      options.boot = {};

    }

    //if the module has been added already, lets merge the options
    for( var i = 0; i < this.bootSchedule.length; i++ ) {

      if( this.bootSchedule[i].name === className ) {

        if( typeof this.bootSchedule[i].options === 'object' ) {
          this.bootSchedule[i].options = merge(options, this.bootSchedule[i].options);
        } else {
          this.bootSchedule[i].options = options;
        }

        break;
      }
    }

    //add the module to the setup schedule
    this.bootSchedule.push( {name: className, options: options } );

  },

  //after setup hook
  afterSetup: function() {

  },

  //before boot hook
  beforeBoot: function() {

  },

  //load & configure modules
  boot: function() {

    //start the load process for each module
    for( var i = 0; i < this.bootSchedule.length; i++ ) {

      if( typeof this.bootSchedule[i].options.setup.before === 'function' ) {
        this.bootSchedule[i].options.setup.before();
      }

      //load the actual module
      this._load(this.bootSchedule[i].name, this.bootSchedule[i].options);

      if( typeof this.bootSchedule[i].options.setup.after === 'function' ) {
        this.bootSchedule[i].options.setup.after();
      }

    }

  },

  //after boot hook
  afterBoot: function() {
  },

  //start our application
  ready: function() {

    //emit event when server is ready
    this.emit('ready');

  }

});
