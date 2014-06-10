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
  Promise = require('bluebird');

module.exports = Class.extend({

  //initialize the application
  _init: function() {

    //console log emblem
    console.log("\n               Super.JS - Super Extendable API Framework");
    console.log("              .<@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@>.");
    console.log("            .<@@@@@@   $$$$$$$$$$$$$$$$$$$$$\\^^^^^^/$$$$@@@>.");
    console.log("         .<@@@@@<   .$$$$$'~       '~'$$$$$$$\\  /$$$$$$>@@@@@>.");
    console.log("      .<@@@@@<'   o$$$$$$                `'$$$$$$$$$$$$  '>@@@@@>.");
    console.log("   .<@@@@@<'    o$$$$$$oo.                  )$$$$$$$$$$     '>@@@@@>.");
    console.log("   '<@@@@@<    o$$$$$$$$$$$.                                 >@@@@@>'");
    console.log("     '<@@@@<  o$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$oooooo...    >@@@@>'");
    console.log("       '@@@@< $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$)>@@@@>'");
    console.log("         '<@@@@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$@@@@>'");
    console.log("           '<@@@@$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$@@@@>'");
    console.log("             '<@@@@<    .oooo.                    .$$@@@@>'");
    console.log("               '<@@@@oo$$$$$$$o..             ..o$$@@@@>'");
    console.log("                 '<@@@@$$$$$$$$$$$$$oooooooo$$$$$@@@@>'");
    console.log("                   '<@@@@'$$$$$$$$$$$$$$$$$$$$$@@@@>'");
    console.log("                     '<@@@@<   ~'SSSSSS'~   >@@@@>'");
    console.log("                       '<@@@@<            >@@@@>'");
    console.log("                         '<@@@@<        >@@@@>'");
    console.log("                           '<@@@@<    >@@@@>'");
    console.log("                             '<@@@@<>@@@@>'");
    console.log("                               '<@@@@@@>'");
    console.log("                                 '<@@>'");
    console.log("                                   ^^\n");

    console.log('SuperJS Version: '+require('../package.json').version);

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

    console.log('server initializing...');

    //configure and start server
    this._initBodyParser();
    this._initLogger();
    this._initAuthentication();
    this._loadMiddleware();
    this._setupOrm();
    this._loadModels();
    this._initOrm();
    this._loadControllers();
    this._configureRouter();

  },

  //load configuration
  _loadConfiguration: function() {

    this.config = {};

    //attempt to load the package json
    this.config.package = require(this.appPath+'/package.json');

    //attempt to load data configuration
    this.config.data = require(this.appPath+'/config/data');

    //attempt to load security configuration
    this.config.security = require(this.appPath+'/config/security');

  },

  //load body parser
  _initBodyParser: function() {

    console.log('loading middleware...');

    var bodyParser = require('body-parser');

    //maintain reference to self
    var self = this;

    //incorporate body parser
    this.express.use(bodyParser.json());

    //detect body parsing error
    this.express.use(function(err, req, res, next) {
      if( err ) {
        res.json({name: self.config.name, version: self.config.version, success: false, message: "The body of your request is invalid.", error: err});
      }
      next();
    });

  },

  //init request logger for development
  _initLogger: function() {

    //log all requests to console for development
    var morgan = require('morgan');
    this.express.use(morgan('dev'));

  },

  //initialize authentication
  _initAuthentication: function() {

    //maintain reference to self
    var self = this;

    //enable passport authentication
    this.passport = require('passport');

    if( this.config.security.enabled ) {

      //initialize passport middleware
      this.express.use(this.passport.initialize());

      //setup strategy based on security.js configuration
      this.passport.use(new this.config.security.strategy(this.config.security.options, function() {
        self.config.security.validator.apply(self, arguments);
      }));

    }
  },

  //load additional middleware
  _loadMiddleware: function() {

    //override hook for additional middleware

  },

  //initialize the waterline ORM
  _setupOrm: function() {

    var Waterline = require('waterline');

    //maintain reference to waterline orm
    this.orm = new Waterline();

  },

  //load models by going through module folders
  _loadModels: function() {

    console.log('loading models...');

    //maintain reference to self
    var self = this;

    //TODO: support alternate folder structure
    //get list of modules
    var modules = fs.readdirSync('./modules');

    //maintain quick list of loaded models for console
    var loadedModels = [];

    //load each controller
    modules.map(function(moduleName) {

      //make sure the controller exists
      if( fs.existsSync(self.appPath+'/modules/'+moduleName+'/model.js') ) {

        var Model = require(self.appPath+'/modules/'+moduleName+'/model');

        if( Model ) {
          self.orm.loadCollection(Model);
          loadedModels.push(moduleName);
        }
      }

    });

    console.log('models loaded:',loadedModels);

  },

  _initOrm: function() {

    //maintain reference to self
    var self = this;

    //initialize the orm
    this.orm.initialize(this.config.data, function(err, models) {

      //TODO: retry/manage app.ormReady state
      if(err) {
        console.log('ORM failed to initialize:');
        console.log(err);

      } else {
        console.log('The ORM is Now Ready...');
        self.models = models.collections;
        self.connections = models.connections;

        self._emit('ormReady', models.collections);
      }
    });

  },

  //load controllers by going through module folders
  _loadControllers: function() {

    console.log('loading controllers...');

    //maintain reference to self
    var self = this;

    //TODO: support alternate folder structure
    //get list of modules
    var modules = fs.readdirSync('./modules');

    //load each controller
    modules.map(function(moduleName) {

      //make sure the controller exists
      if( fs.existsSync(self.appPath+'/modules/'+moduleName+'/controller.js') ) {

        var Controller = require(self.appPath+'/modules/'+moduleName+'/controller');

        if( Controller ) {
          self.controllers[moduleName] = new Controller(self);
        }
      }

    });

    console.log('controllers loaded:',Object.keys(this.controllers));

  },

  //configure the router
  _configureRouter: function() {

    console.log('configuring router...');

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

  //initialize the response object
  _initResponse: function(req, res, next) {

    console.log('initializing response...');
    this._setResponse({name: this.config.package.name, version: this.config.package.version}, res);
    return next();

  },

  //process request for REST & RPC methods
  _processRequest: function(req, res, next) {

    console.log('processing request...');

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

      return next();

    }

    return this._sendResponse(req,res);

  },

  //check authentication
  _authenticateRequest: function(req, res, next) {

    console.log('authenticating request...');

    //maintain reference to self
    var self = this;

    //check if authentication is enabled
    if( !this.config.security.enabled ) {
      console.log('authentication disabled...');
      return next();
    }

    //check if the requested action is public
    if( this.controllers[req.controller].public && _.contains(this.controllers[req.controller].public, req.action) ) {

      console.log('requested method is public, skipping auth...');
      return next();

    } else {

      //execute authenticate strategy
      this.passport.authenticate(this.config.security.type, function(err, user, info) {

        if(err) {
          self._setResponse({success: false, message: 'An error occurred trying to authenticate your request.'}, res);
          self._sendResponse(req, res);
        }

        if(!user) {
          self._setResponse({success: false, message: 'Your request could not be authenticated.'}, res);
          self._sendResponse(req, res);
        }

        //log the user into the request
        req.login(user, self.config.security.options, function(err) {
          if(err) next(err);
          return next();
        });

      })(req, res, next);

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

      console.log('executing controller action:', req.controller+'->'+req.action);

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

  //send response
  _sendResponse: function(req, res) {

    //send response
    res.json(res.response);

  },

  //start server
  start: function() {

    //define port
    var port = process.env.PORT || this.config.port || 8888;
    console.log('starting server on port:', port);

    //start listening on port
    this.express.listen(port);

    this._emit('started');

  }

});