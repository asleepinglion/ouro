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
  _init: function() {

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
    this._initLogger();

    //state version
    this.log.notify('SuperJS Version: '+require('../package.json').version);
    this.log.info('server initializing...');

    //set application path
    this.appPath = path.dirname(process.mainModule.filename);

    //load configuration
    this._loadConfiguration();

    //instantiate express application
    this.express = express();

    //maintain list of database connections
    this.connections = [];

    //maintain list of models
    this.models = [];

    //maintain list of loaded controllers
    this.controllers = [];

    //server initialization
    this._loadMiddleware();
    this._initDBEngine();
    this._loadControllers();
    this._configureRouter();
  },

  //init request logger for development
  _initLogger: function() {

    var LogEngine = require('superjs-log');
    this.log = new LogEngine();

  },

  //load configuration
  _loadConfiguration: function() {

    this.config = {};

    //attempt to load the package json
    if( fs.existsSync(this.appPath+'/package.json') ) {
      this.config.package = require(this.appPath + '/package.json');
    } else {
      console.error('A package.json is required ('+this.appPath + '/package.json'+')');
      process.exit();
    }

    //attempt to load server configuration
    if( fs.existsSync(this.appPath+'/config/server.js') ) {
      this.config.server = require(this.appPath+'/config/server');
    } else {
      console.error('The server.js configuration is required ('+this.appPath+'/config/server.js)');
      process.exit();
    }

    //attempt to load data configuration
    if( fs.existsSync(this.appPath+'/config/data.js') ) {
      this.config.data = require(this.appPath+'/config/data');
    } else {
      console.error('The data.js configuration is required ('+this.appPath+'/config/data.js)');
      process.exit();
    }

    //attempt to load security configuration
    if( fs.existsSync(this.appPath+'/config/security.js') ) {
      this.config.security = require(this.appPath+'/config/security');
    } else {
      console.error('The security.js configuration is required ('+this.appPath+'/config/security.js)');
      process.exit();
    }

    //warn about authentication being disabled
    if( !this.config.security.enabled ) {
      this.log.warn('authentication disabled - see the security configuration file.');
    }

  },

  //init CORS (cross origin resource sharing)
  _initCORS: function() {

    var cors = require('cors');

    this.express.use(cors());

  },

  //load body parser
  _initBodyParser: function() {

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
  _loadMiddleware: function() {

    this.log.info('loading middleware...');

    this._initCORS();
    this._initBodyParser();

  },

  _initDBEngine: function() {

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
  _loadControllers: function() {

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
            var controller = new Controller(self);
            self.controllers[controller.name] = controller;
          }
        }

      });

    } else if( fs.existsSync(self.appPath+'/controllers') ) {

      //get list of modules
      var controllers = fs.readdirSync(self.appPath+'/controllers');

      //load each controller
      controllers.map(function(controllerName) {

        controllerName = controllerName.split('.')[0];

        var Controller = require(self.appPath + '/controllers/' + controllerName);

        if (Controller) {
          var controller = new Controller(self);
          self.controllers[controller.name] = controller;
        }

      });

    }

    this.log.info('controllers loaded:',Object.keys(this.controllers));

  },

  //configure the router
  _configureRouter: function() {

    this.log.info('configuring router...');

    //maintain reference to self
    var self = this;

    //setup default route
    this.express.get('/', function(req, res) {
      self._defaultResponse(req, res);
    });

    //setup describe route
    this.express.get('/describe', function(req, res) {
      self._describeResponse(req, res);
    });

    //setup request & response chain
    this.express.all('*',
      function(req, res, next) { self._initResponse(req, res, next) },
      function(req, res, next) { self._processRequest(req, res, next) },
      function(req, res, next) { self._authenticateRequest(req, res, next) },
      function(req, res, next) { self._handleRequest(req, res, next) }
    );

  },

  //send default response
  _defaultResponse: function(req, res) {

    res.json({name: this.config.package.name, version: this.config.package.version, success: true});

  },

  //send default response
  _describeResponse: function(req, res) {

    //init response object
    var response = {name: this.config.package.name, version: this.config.package.version, success: true, controllers: {}};

    //loop through controllers
    for( var controllerName in this.controllers ) {

      response.controllers[controllerName] = [];

      //loop through methods
      for( var method in this.controllers[controllerName] ) {

        //don't expose internal methods
        if( typeof this.controllers[controllerName][method] === 'function' && method.substr(0,1) !== '_' ) {
          response.controllers[controllerName].push(method);
        }
      }

    }

    res.json(response);

  },

  //override this to manipulate the request
  _beforeAction: function(req, res) {
    return;
  },

  //initialize the response object
  _initResponse: function(req, res, next) {

    //trigger before action hook
    this._beforeAction(req, res);

    //log access
    this.log.access(req.method+' '+req.path+' '+req.ip, req.body);

    //initialize response object
    this._setResponse({name: this.config.package.name, version: this.config.package.version}, res);

    //set the request start time
    req.startTime = new Date();

    //proceed to next request process
    return next();

  },

  //process request for REST & RPC methods
  _processRequest: function(req, res, next) {

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

          //do not allow access to internal methods
          if( path[2].substring(0,1) !== '_' ) {

            //check if action exists on controller
            if( path[2] in this.controllers[path[1]]) {

              //set the action name
              req.action = path[2];
            }
          }
        }
      }

      if( !req.controller ) {
        this._setResponse({success: false, message: 'Controller not found.'}, res);
        return this._sendResponse(req,res);
      }

      if( !req.action ) {
        if( req.actionType === 'REST' )
          this._setResponse({success: false, message: 'REST Controller method '+req.method+' invalid.'}, res);
        else
          this._setResponse({success: false, message: 'Controller RPC method not found.'}, res);
        return this._sendResponse(req,res);
      }

      this.log.info('routing request:',{controller: req.controller, action: req.action});

      return next();

    }

    return this._sendResponse(req,res);

  },

  //check authentication
  _authenticateRequest: function(req, res, next) {

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
      if( !this.controllers[controllerName] || !this.controllers[controllerName]._authorize ) {
        this.log.error("The "+controllerName+" controller's _authorize method has not been implemented.");
        this._setResponse({success: false, message: "The "+controllerName+" controller's _authorize method has not been implemented."}, res);
        return this._sendResponse(req,res);
      }

      //execute authorize method on the auth controller
      this.controllers[controllerName]._authorize(req, function(err, user) {

        if( err || !user) {

          //if there was an error or the user was not found return failure
          self._setResponse({success: false, message: "Authentication failed.", error: err}, res);
          return self._sendResponse(req,res);

        } else {

          //otherwise continue to process request
          return next();
        }

      });

    }

  },

  //handle request
  _handleRequest: function(req, res, next) {

    //TODO: rewrite execution using promises

    //maintain reference to self
    var self = this;

    //emit beforeAction event for secondary procedures
    this.controllers[req.controller]._emit('beforeAction', req);

    //call before action method
    this.controllers[req.controller]._beforeAction(req, function(response) {

      //update response
      self._setResponse(response, res);

      //call controller action
      self.controllers[req.controller][req.action](req, function(response) {

        //update response
        self._setResponse(response, res);

        //call after action method
        self.controllers[req.controller]._afterAction(req, res.response, function(response) {

          //update response
          self._setResponse(response, res);

          //emit afterAction event for secondary procedures
          self.controllers[req.controller]._emit('afterAction', req, res.response);

          self._sendResponse(req, res);

        });

      });

    });

  },

  //merge object onto res.response
  _setResponse: function(obj, res) {

    if( !obj )
      return;

    if( !res.response )
      res.response = {};

    //extend response object with obj
    res.response = _.extend(res.response, obj);

  },

  //override this to manipulate the request
  _afterAction: function(req, res) {
    return;
  },

  //send response
  _sendResponse: function(req, res) {

    //calculate request time
    var endTime = new Date();
    var requestDuration = endTime - req.startTime;
    res.response.duration = requestDuration + 'ms';

    this.log.info('request duration:',{duration: requestDuration, unit:'ms'});
    this.log.break();

    //trigger after action hook
    this._afterAction(req,res);

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

    this._emit('started');

  }

});