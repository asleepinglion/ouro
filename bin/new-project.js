/**
 * SuperJS New Project
 * Start a new SuperJS Project
 */

var Class = require('superjs-base');
var colors = require('colors');
var fs = require('fs');

//TODO: this needs to be reworked, doesn't feel versatile enough

module.exports = Class.extend({

  //command properties
  command: "new [name]",
  description: "Start a new SuperJS API Project...",
  options: [
    ['-e, --dbEngine [type]', 'Specify the database engine.']
  ],

  //localize variables
  init: function(app) {

    this.app = app;
    this.hb = app.hb;
    this.config = app.config;
    this.templatePath = app.config.cliPath+'/templates/starter';
  },

  //command action hook
  action: function(name) {

    //add break;
    this.app.log.break();

    //make sure the name has been provided
    if (!name) {
      this.app.log.error("CLANK!: " + colors.white("You must provide the [name] for your new project."));
      this.app.log.warn(this._cmd.helpInformation());
      process.exit(0);
    }

    //set the project path
    var projectPath = this.app.config.appPath + "/" + name;

    //make sure the directory does not already exist
    if (fs.existsSync(projectPath)) {
      this.app.log.error("CLANK!: " + colors.white("The project specified already exists:"),projectPath);
      process.exit(0);
    }

    //determine the dbengine to use
    var dbEngine = (this._cmd.dbEngine) ? this._cmd.dbEngine : "thinky";

    this.app.log.info(":: creating new project folder:", name);

    //create the directory
    fs.mkdirSync(projectPath);

    //setup the data object for templating
    var data = {projectName: name, dbEngine: dbEngine };

    //get the list of files
    var rawProjectTemplate = fs.readFileSync(this.templatePath + "/.superjs", {encoding: "utf-8"});
    var projectTemplate = this.hb.compile(rawProjectTemplate);
    var projectDef = projectTemplate(data);

    //parse json list of files
    project = JSON.parse(projectDef);

    //create folders
    var folders = project.folders;
    for (var folder in folders) {
      fs.mkdirSync(projectPath + "/" + folders[folder]);
    }

    //generate & save the result files
    var files = project.files;
    for (var file in files) {

      var fromFileName = "";
      var toFileName = "";

      //is the from the same as the to?
      if (files[file] === true) {

        fromFileName = file;
        toFileName = file;

      } else {

        fromFileName = files[file];
        toFileName = file;
      }

      //load the raw template
      var rawTemplate = fs.readFileSync(this.templatePath+ "/" + fromFileName, {encoding: 'utf-8'});

      //compile the template
      var template = this.hb.compile(rawTemplate);

      //execute the template against the data
      var result = template(data);

      //write the process template to the file
      fs.writeFileSync(projectPath+ "/" + toFileName, result);

      this.app.log.info(":: created file:", toFileName);
    }

    this.app.log.info(":: project created, enjoy!\n");
  }

});