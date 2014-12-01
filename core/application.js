/*
 * Application *
 * the base application used by the API *
 *
 * @exports Application
 */

//load dependencies

var express = require('express'),
  Class = require('./base'),
  events = require('events'),
  util = require('util'),
  fs = require('fs'),
  path = require('path'),
  domain = require('domain'),
  _ = require('underscore'),
  Promise = require('bluebird'),
  colors = require('colors/safe');

module.exports = Class.extend({

  //initialize the application
  init: function() {

    //console log emblem
    console.log(colors.cyan("\n\n  sSSs   .S       S.    .S_sSSs      sSSs   .S_sSSs        .S    sSSs  "));
    console.log(colors.cyan(" d%%%%SP  .SS       SS.  .SS~YS%%%%b    d%%%%SP  .SS~YS%%%%b      .SS   d%%%%SP  "));
    console.log(colors.cyan("d%S'    S%S       S%S  S%S   `S%b  d%S'    S%S   `S%b     S%S  d%S'    "));
    console.log(colors.cyan("S%|     S%S       S%S  S%S    S%S  S%S     S%S    S%S     S%S  S%|     "));
    console.log(colors.cyan("S&S     S&S       S&S  S%S    d*S  S&S     S%S    d*S     S&S  S&S     "));
    console.log(colors.cyan("Y&Ss    S&S       S&S  S&S   .S*S  S&S_Ss  S&S   .S*S     S&S  Y&Ss    "));
    console.log(colors.red("`S&&S   S&S       S&S  S&S_sdSSS   S&S~SP  S&S_sdSSS      S&S  `S&&S   "));
    console.log(colors.red("  `S*S  S&S       S&S  S&S~YSSY    S&S     S&S~YSY%b      S&S    `S*S  "));
    console.log(colors.red("   l*S  S*b       d*S  S*S         S*b     S*S   `S%b     d*S     l*S  "));
    console.log(colors.red("  .S*P  S*S.     .S*S  S*S         S*S.    S*S    S%S    .S*S    .S*P  "));
    console.log(colors.red("sSS*S    SSSbs_sdSSS   S*S          SSSbs  S*S    S&S  sdSSS   sSS*S   "));
    console.log(colors.red("YSS'      YSSP~YSSY    S*S           YSSP  S*S    SSS  YSSY    YSS'    "));
    console.log(colors.red("                       SP                  SP                          "));
    console.log(colors.red("                       Y                   Y                           \n"));


    //initialize logger
    this.initLogger();

    //state version
    this.log.notify('SuperJS Version: '+require('../package.json').version);
    this.log.info('server initializing...');

    //set application path
    this.appPath = path.dirname(process.mainModule.filename);

    //load configuration
    this.loadConfiguration();

    //instantiate express application
    this.express = express();

    //maintain list of database connections
    this.connections = {};

    //maintain list of models
    this.models = {};

    //maintain list of loaded controllers
    this.controllers = {};

    //maintain list of available external methods
    this.externalMethods = {};

    //server initialization
    this.loadMiddleware();
    this.initDBEngine();
    this.loadControllers();
    this.buildMethodMap();
    this.configureRouter();
  },

  //init request logger for development
  initLogger: function() {

    console.log('initializing the logger....');

    var LogEngine = require('superjs-logger');
    this.log = new LogEngine(this);
  },

  //load configuration
  loadConfiguration: function() {

    //setup configuration object
    this.config = {};

    //attempt to load the package json
    if( fs.existsSync(this.appPath+'/package.json') ) {
      this.config.package = require(this.appPath + '/package.json');
    } else {
      console.error('A package.json is required ('+this.appPath + '/package.json'+')');
      process.exit();
    }

    //set default configuration path
    this.configPath = '/config';

    //detect environment path
    if( fs.existsSync(this.appPath+this.configPath+'/environment.js') ) {
      this.configPath = require(this.appPath+this.configPath+'/environment')();
    }

    this.log.info('using configuration path:', this.appPath+this.configPath);

    //attempt to load server configuration
    if( fs.existsSync(this.appPath+this.configPath+'/server.js') ) {
      this.config.server = require(this.appPath+this.configPath+'/server');
    } else {
      console.error('The server.js configuration is required ('+this.appPath+this.configPath+'/server.js)');
      process.exit();
    }

    //attempt to load data configuration
    if( fs.existsSync(this.appPath+this.configPath+'/data.js') ) {
      this.config.data = require(this.appPath+this.configPath+'/data');
    } else {
      console.error('The data.js configuration is required ('+this.appPath+this.configPath+'/data.js)');
      process.exit();
    }

    //attempt to load security configuration
    if( fs.existsSync(this.appPath+this.configPath+'/security.js') ) {
      this.config.security = require(this.appPath+this.configPath+'/security');
    } else {
      console.error('The security.js configuration is required ('+this.appPath+this.configPath+'/security.js)');
      process.exit();
    }

    //warn about authentication being disabled
    if( !this.config.security.enabled ) {
      this.log.warn('authentication disabled - see the security configuration file.');
    }

  },

  //init CORS (cross origin resource sharing)
  initCORS: function() {

    var cors = require('cors');
    this.express.use(cors());

  },

  //load body parser
  initBodyParser: function() {

    var bodyParser = require('body-parser');

    //maintain reference to self
    var self = this;

    //parse body for urlencoded form data
    this.express.use(bodyParser.urlencoded());

    //parse body for json
    this.express.use(bodyParser.json());

    //detect body parsing error
    this.express.use(function(err, req, res, next) {
      if( err ) {
        res.json({name: self.config.name, version: self.config.version, success: false, message: "The body of your request is invalid.", error: err});
      }
      next();
    });

  },

  //load additional middleware
  loadMiddleware: function() {

    this.log.info('loading middleware...');

    this.initCORS();
    this.initBodyParser();

  },

  initDBEngine: function() {

    //make sure an engine has been specified
    if( _.isEmpty(this.config.data.engine) ) {
      console.error('You must specify an engine to use, e.g.: rethink, waterline etc.');
      process.exit();
    }

    //make sure the node module is present
    if( !fs.existsSync(this.appPath+'/node_modules/superjs-'+this.config.data.engine) ) {
      console.error('The engine you specified was not found, make sure you have installed the package: npm install superjs-rethink');
      process.exit();
    }

    //load the engine module
    this.engine = require(this.appPath+'/node_modules/superjs-'+this.config.data.engine);

    //initialize the engine
    var initializer = new this.engine.Initializer(this);

  },

  //load controllers by going through module folders
  loadControllers: function() {

    this.log.info('loading controllers...');

    //maintain reference to self
    var self = this;

    //check if files are stored in modules or by type
    if( fs.existsSync(self.appPath+'/modules') ) {

      //get list of modules
      var modules = fs.readdirSync(self.appPath+'/modules');

      //load each controller
      modules.map(function(moduleName) {

        //make sure the controller exists
        if (fs.existsSync(self.appPath + '/modules/' + moduleName + '/controller.js')) {

          var Controller = require(self.appPath + '/modules/' + moduleName + '/controller');

          if (Controller) {
            self.loadController(moduleName, Controller);
          }
        }

      });

    } else if( fs.existsSync(self.appPath+'/controllers') ) {

      //get list of modules
      var controllers = fs.readdirSync(self.appPath+'/controllers');

      //load each controller
      controllers.map(function(controllerName) {

        //split the filename
        controllerName = controllerName.split('.')[0];

        var Controller = require(self.appPath + '/controllers/' + controllerName);

        if (Controller) {
          self.loadController(controllerName, Controller);
        }

      });

    }

    this.log.info('controllers loaded:',Object.keys(this.controllers));

  },

  //load the controller
  loadController: function(controllerName, Controller) {

    //instantiate the controller
    var controller = new Controller(this);

    //assign a name, if one is not assigned
    if( !controller.name)
      controller.name = controllerName;

    //make the controller available to the application
    this.controllers[controller.name] = controller;
    this.externalMethods[controller.name] = {};

  },

  //build controller method maps
  buildMethodMap: function() {

    var firstCharacter = '';

    //loop through controllers
    for( var controllerName in this.controllers ) {

      //loop through methods
      for( var method in this.controllers[controllerName] ) {

        //we only want functions
        if( typeof this.controllers[controllerName][method] === 'function' ) {

          //capture the first character of the method name
          firstCharacter = method.substr(0,1);

          //underscores or capital letters signify external methods
          if(firstCharacter == '_') {

            this.externalMethods[controllerName][method.substr(1,method.length-1)] = method;

          } else if(firstCharacter === firstCharacter.toUpperCase() && firstCharacter !== firstCharacter.toLowerCase() ) {

            this.externalMethods[controllerName][firstCharacter.toLowerCase()+method.substr(1,method.length-1)] = method;

          }

        }
      }

    }
  },

  //configure the router
  configureRouter: function() {

    this.log.info('configuring router...');

    //maintain reference to self
    var self = this;

    //setup default route
    this.express.get('/', function(req, res) {
      self.defaultResponse(req, res);
    });

    //setup describe route
    this.express.get('/describe', function(req, res) {
      self.describeResponse(req, res);
    });

    //setup request & response chain
    this.express.all('*',
      function(req, res, next) { self.initResponse(req, res, next) },
      function(req, res, next) { self.processRequest(req, res, next) },
      function(req, res, next) { self.authenticateRequest(req, res, next) },
      function(req, res, next) { self.handleRequest(req, res, next) }
    );

  },

  //send default response
  defaultResponse: function(req, res) {

    res.json({name: this.config.package.name, version: this.config.package.version, success: true});

  },

  //send default response
  describeResponse: function(req, res) {

    //init response object
    var response = {name: this.config.package.name, version: this.config.package.version, success: true};

    //add external method map to the response
    response.controllers = this.externalMethods;

    res.json(response);

  },

  //override this to manipulate the request
  beforeAction: function(req, res) {
    return;
  },

  //initialize the response object
  initResponse: function(req, res, next) {

    //trigger before action hook
    this.beforeAction(req, res);

    //log access
    this.log.access(req.method+' '+req.path+' '+req.ip, req.body);

    //initialize response object
    this.setResponse({name: this.config.package.name, version: this.config.package.version}, res);

    //set the request start time
    req.startTime = new Date();

    //proceed to next request process
    return next();

  },

  //process request for REST & RPC methods
  processRequest: function(req, res, next) {

    var path = req.path.split('/');

    if( path.length > 1 ) {

      //Handle REST Resource Routes
      if( path.length == 2 ) {

        req.actionType = 'REST';

        if( path[1] in this.controllers ) {

          //set controller name
          req.controller = path[1];

          //check to see if this controller is rest enabled
          if (this.controllers[req.controller].restEnabled ) {

            //determine action based on request method
            if (req.method === 'GET') {
              req.action = 'search';
            } else if (req.method === 'POST') {
              req.action = 'create';
            } else if (req.method === 'PUT') {
              req.action = 'update';
            } else if (req.method === 'DELETE') {
              req.action = 'delete';
            }
          }

        }

        //handle RPC routes
      } else if( path.length >= 3 ) {

        req.actionType = 'RPC';

        //check if controller exists
        if( path[1] in this.controllers ) {

          //set the controller name
          req.controller = path[1];

          //check if action exists on controller
          if( path[2] in this.externalMethods[path[1]]) {

            //set the action name
            req.action = path[2];
          }

        }
      }

      if( !req.controller ) {
        this.setResponse({success: false, message: 'Controller not found.'}, res);
        return this.sendResponse(req,res);
      }

      if( !req.action ) {
        if( req.actionType === 'REST' )
          this.setResponse({success: false, message: 'REST Controller method '+req.method+' invalid.'}, res);
        else
          this.setResponse({success: false, message: 'Controller RPC method not found.'}, res);
        return this.sendResponse(req,res);
      }

      this.log.info('routing request:',{controller: req.controller, action: req.action});

      return next();

    }

    return this.sendResponse(req,res);

  },

  //check authentication
  authenticateRequest: function(req, res, next) {

    //maintain reference to self
    var self = this;

    //check if authentication is enabled
    if( !this.config.security.enabled ) {
      return next();
    }

    //check if the requested action is public
    if( this.controllers[req.controller].public && _.contains(this.controllers[req.controller].public, req.action) ) {

      return next();

    } else {

      this.log.info('authenticating request...');

      //determine controller name for auth
      var controllerName = ( this.config.security.controllerName ) ? this.config.security.controllerName : 'user';

      //make sure the _authorize method has been implemented on the auth controller
      if( !this.controllers[controllerName] || !this.controllers[controllerName].authorize ) {
        this.log.error("The "+controllerName+" controller's authorize method has not been implemented.");
        this.setResponse({success: false, message: "The "+controllerName+" controller's _authorize method has not been implemented."}, res);
        return this.sendResponse(req,res);
      }

      //execute authorize method on the auth controller
      this.controllers[controllerName].authorize(req, function(err, user) {

        if( err || !user) {

          //if there was an error or the user was not found return failure
          self.setResponse({success: false, message: "Authentication failed.", error: err}, res);
          return self.sendResponse(req,res);

        } else {

          //otherwise continue to process request
          return next();
        }

      });

    }

  },

  //handle request
  handleRequest: function(req, res, next) {

    //TODO: rewrite execution using promises?

    //maintain reference to self
    var self = this;

    //emit beforeAction event for secondary procedures
    this.controllers[req.controller].emit('beforeAction', req);

    //call before action method
    this.controllers[req.controller].beforeAction(req, function(response) {

      //update response
      self.setResponse(response, res);

      //call controller action using the lookup from the external method map
      self.controllers[req.controller][self.externalMethods[req.controller][req.action]](req, function(response) {

        //update response
        self.setResponse(response, res);

        //call after action method
        self.controllers[req.controller].afterAction(req, res.response, function(response) {

          //update response
          self.setResponse(response, res);

          //emit afterAction event for secondary procedures
          self.controllers[req.controller].emit('afterAction', req, res.response);

          self.sendResponse(req, res);

        });

      });

    });

  },

  //merge object onto res.response
  setResponse: function(obj, res) {

    if( !obj )
      return;

    if( !res.response )
      res.response = {};

    //extend response object with obj
    res.response = _.extend(res.response, obj);

  },

  //override this to manipulate the request
  afterAction: function(req, res) {
    return;
  },

  //send response
  sendResponse: function(req, res) {

    //calculate request time
    var endTime = new Date();
    var requestDuration = endTime - req.startTime;
    res.response.duration = requestDuration + 'ms';

    this.log.info('request duration:',{duration: requestDuration, unit:'ms'});
    this.log.break();

    //trigger after action hook
    this.afterAction(req,res);

    //send response
    res.json(res.response);

  },

  //start server
  start: function() {

    //define port
    var port = process.env.PORT || this.config.server.port || this.config.package.port || 8888;
    this.log.info('starting server on port:', port);
    this.log.break();

    //start listening on port
    this.express.listen(port);

    this.emit('started');

  }

});
