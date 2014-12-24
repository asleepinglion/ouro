/**
 * SuperJS Generate
 * Generate files for your SuperJS application
 */

var Class = require('superjs-base');
var fs = require('fs');
var path = require('path');
var colors = require('colors');

module.exports = Class.extend({

  init: function(app) {

    this.app = app;
    this.hb = app.hb;
    this.config = app.config;
    this.templatePath = app.config.cliPath+'/templates';
  },

  run: function(type, name) {

    //verify we are in the root directory
    this.app.verifyRoot();

    //add break;
    this.app.log.break();

    //make sure the type has been provided
    if( !type ) {
      this.app.log.error("BOOM!: "+colors.white("You must provide the [type] of template to generate."));
      this.app.log.warn(this._cmd.helpInformation());
      return;
    }

    //make sure the name has been provided
    if( !name ) {
      this.app.log.error("CLANK!: "+colors.white("You must provide the [name] for your new "+type+"."));
      this.app.log.warn(this._cmd.helpInformation());
      return;
    }

    //lowercase the type
    type = type.toLowerCase();

    //attempt match against controllers
    if( type === "controller" ) {
      this.controller(name);
    } else if( type === "model" ) {
      this.model(name);
    } else if( type === "resource" ) {
      this.resource(name);
    } else {
      console.log('The specified type does not exist.');
    }

    this.app.log.break();
    process.exit(0);

  },

  //generate both a controller and a model
  createResource: function(name) {
    this.createController(name);
    this.createModel(name);
  },

  //generate controllers
  createController: function(name) {

    this.app.log.info(":: generating controller:",name.toLowerCase());

    //maintain reference to the current instance
    var self = this;

    var templatePath =this.templatePath+'/controller';

    //determine controller type based on the database engine
    if( !this._cmd.dbEngine ) {
      templatePath += "/controller.js";
    } else if( this._cmd.dbEngine === 'waterline' ) {
      templatePath += "/waterline.js";
    } else {
      templatePath += "/thinky.js";
    }

    //load the raw template
    var rawTemplate = fs.readFileSync(templatePath, {encoding: 'utf-8'});

    //compile the template
    var template = this.hb.compile(rawTemplate);

    //execute the template against the data
    var result = template({controllerName: name});

    //make sure the modules folder exists
    if( !fs.existsSync(this.config.appPath+"/modules") ) {

      //TODO: use prompt to make sure the user wants to do this
      //this.app.cli.confirm('Would you like to create the modules directory?', function(answer) {
      //  console.log("answer:",answer);
      //});
    }

    //store the resource path
    var resourcePath = this.config.appPath+"/modules/"+name.toLowerCase();

    //create resource folder if it doesn't exist
    if( !fs.existsSync(resourcePath) ) {
      this.app.log.info(":: creating resource folder:", resourcePath);
      fs.mkdirSync(resourcePath);
    }

    var filePath = resourcePath+"/controller.js";

    //don't overwrite the file unless the --force option is present
    if( !fs.existsSync(filePath) || this._cmd.force ) {

      //write the process template to the file
      fs.writeFileSync(filePath, result);

      this.app.log.info(":: created controller:", filePath);

    } else {
      this.app.log.error("\nCLANK!: "+colors.white("The requested controller name already exists, --force to overwrite.\n"));
      process.exit(0);
    }

  },

  //generate models
  createModel: function(name) {

    this.app.log.info(":: generating model:",name.toLowerCase());

    //maintain reference to the current instance
    var self = this;

    var templatePath =this.templatePath+'/model';

    //determine controller type based on the database engine
    if( !this._cmd.dbEngine ) {
      templatePath += "/model.js";
    } else if( this._cmd.dbEngine === 'waterline' ) {
      templatePath += "/waterline.js";
    } else {
      templatePath += "/thinky.js";
    }

    //load the raw template
    var rawTemplate = fs.readFileSync(templatePath, {encoding: 'utf-8'});

    //compile the template
    var template = this.hb.compile(rawTemplate);

    //execute the template against the data
    var result = template({modelName: name});

    var modulesPath = this.config.appPath+"/modules";

    //store the resource path
    var resourcePath = this.config.appPath+"/modules/"+name.toLowerCase();

    //make sure the modules directory exist
    if( !fs.existsSync(modulesPath) ) {
      this.app.log.info(":: creating modules folder:", modulesPath);
      fs.mkdirSync(modulesPath);
    }

    //create resource folder if it doesn't exist
    if( !fs.existsSync(resourcePath) ) {
      this.app.log.info(":: creating resource folder:", resourcePath);
      fs.mkdirSync(resourcePath);
    }

    //store the resource path
    var resourcePath = this.config.appPath+"/modules/"+name.toLowerCase();

    //create resource folder if it doesn't exist
    if( !fs.existsSync(resourcePath) ) {
      this.app.log.info(":: creating resource folder:", resourcePath);
      fs.mkdirSync(resourcePath);
    }

    var filePath = resourcePath+"/model.js";

    //don't overwrite the file unless the --force option is present
    if( !fs.existsSync(filePath) || this._cmd.force ) {

      //write the process template to the file
      fs.writeFileSync(filePath, result);

      this.app.log.info(":: created model:", filePath);

    } else {
      this.app.log.error("\nThe requested model name already exists, --force to overwrite.\n");
      process.exit(0);
    }

  }

});

