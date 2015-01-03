#!/usr/bin/env node

/**
 * @module API
 * @submodule CLI
 */

"use strict";

var SuperJS = require('../index');
SuperJS.CLI = require('superjs-cli').CLI;

var colors = require('colors');
var handlebars = require('handlebars');
var fs = require('fs');
var pkg = require('../package.json');
var path = require('path');

/**
 * SuperJS CLI
 * Extension of the the SuperJS-Commander Class
 *
 * @class SuperCLI
 * @extends SuperJS.CLI
 */

var CLI = SuperJS.CLI.extend({

  init: function(config) {

    //load handlebars templating engine
    this.hb = handlebars;

    //pass config to base class
    this._super(config);

    //set the path for handle bar helpers
    this.config.helperPath = this.config.cliPath+"/helpers";

    //set the template path
    this.config.templatePath = this.config.cliPath+'/templates';

    //register handlebar helpers for templates
    this.registerHelpers();

  },

  verifyRoot: function() {

    //determine the application's working directory path
    this.config.appPkgPath = path.resolve(this.config.appPath, 'package.json');

    //make sure we are in the root directory
    try {
      this.config.appPkg = require(this.config.appPkgPath);
    } catch (e) {
      this.config.appPkg = false;
    }

    if( !this.config.appPkg ) {
      this.log.error("\nThe SuperJS command must be run from the project root.");
      process.exit(0);
    }

  },

  //loop through helpers folder and register them with handlebars
  registerHelpers: function() {

    //maintain reference to self
    var self = this;

    //get list of helpers based on file name
    var helpers = fs.readdirSync(this.config.helperPath);

    //bind each helper
    helpers.map(function(fileName) {

      //load the helpers
      var helper = require(self.config.helperPath + "/" + fileName.split('.')[0]);

      //register the helper
      self.hb.registerHelper(fileName.split('.')[0], helper);

    });

  }
});

//instantiate and configure the cli
var cli = new CLI({version: pkg.version });

//start the cli and process arguments
cli.start();