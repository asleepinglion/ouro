#!/usr/bin/env node

/**
 * SuperJS CLI
 * Extension of the the SuperJS-Commander Class
 *
 * @class SuperCLI
 * @extends SuperJS.Commander
 */

"use strict";

var SuperCommander = require('superjs-commander');
var colors = require('colors');
var handlebars = require('handlebars');
var fs = require('fs');
var pkg = require('../package.json');
var path = require('path');

//TODO: refactor with custom solution for the superjs-cli -- see notes on superjs-commander

var SuperCLI = SuperCommander.extend({

  init: function(config) {

    //console log emblem
    console.log();
    console.log(colors.cyan("SuperJS API Framework")+" - "+colors.white('Version: '+config.version));
    console.log(colors.gray("Super Extendable Framework for Rapid API Development"));

    //load handlebars templating engine
    this.hb = handlebars;

    //pass config to base class
    this._super(config);

    //set the path for handle bar helpers
    this.config.helperPath = this.config.cliPath+"/helpers";

    //register handlebar helpers for templates
    this.registerHelpers();

    //parse the command line
    this.parse();

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

var superCLI = new SuperCLI({

  //set the version based on the package
  version: pkg.version,

  //enable automatic help responses
  autoHelp: true,

  //enable version aliases
  versionAliases: true

});