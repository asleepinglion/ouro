"use strict";

var express = require('express');
var SuperJS = require('./index');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var _ = require('underscore');
var merge = require('recursive-merge');
var colors = require('colors/safe');
//var util = require('util');
//var domain = require('domain');

/**
 * The SuperJS Application Class is the heart of the API, responsible for configuring express,
 * any middleware, loading services, managing routes & connections, and responding to requests.
 *
 * @exports Application
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = SuperJS.Class.extend({

  //initialize the application
  init: function() {

    //define name
    this.name = 'application';

    //display emblem
    this.displayEmblem();

    //initialize logger
    this.initLogger();

    //state version
    console.log(colors.cyan('SuperJS Version: ') + require('./package.json').version);

    //set application path
    this.appPath = path.dirname(process.mainModule.filename);

    //load configuration
    this.loadConfiguration();

    //instantiate express application
    this.express = express();

    //maintain list of middleware to load
    this.middleware = [];

    //maintain list of database connections
    this.connections = {};

    //maintain list of models
    this.models = {};

    //maintain list of loaded controllers
    this.controllers = {};

    //maintain list of loaded services
    this.services = {};

    //maintain list of available external methods
    this.externalMethods = {};

    //server initialization
    this.enableMiddleware();
    this.loadMiddleware();
    this.loadServices();
    this.loadControllers();
    this.buildMethodMap();
    this.loadBlueprints();
    this.initConnections();

  },

  //print superjs emblem to standard output
  displayEmblem: function() {

    console.log(colors.cyan("\n\n  sSSs   .S       S.    .S_sSSs      sSSs   .S_sSSs        .S    sSSs  "));
    console.log(colors.cyan(" d%%%%SP  .SS       SS.  .SS~YS%%%%b    d%%%%SP  .SS~YS%%%%b      .SS   d%%%%SP  "));
    console.log(colors.cyan("d%S'    S%S       S%S  S%S   `S%b  d%S'    S%S   `S%b     S%S  d%S'    "));
    console.log(colors.cyan("S%|     S%S       S%S  S%S    S%S  S%S     S%S    S%S     S%S  S%|     "));
    console.log(colors.cyan("S&S     S&S       S&S  S%S    d*S  S&S     S%S    d*S     S&S  S&S     "));
    console.log(colors.cyan("Y&Ss    S&S       S&S  S&S   .S*S  S&S_Ss  S&S   .S*S     S&S  Y&Ss    "));
    console.log(colors.red("`S&&S   S&S       S&S  S&S_sdSSS   S&S~SP  S&S_sdSSS      S&S  `S&&S   "));
    console.log(colors.red("  `S*S  S&S       S&S  S&S~YSSY    S&S     S&S~YSY%b       S&S    `S*S  "));
    console.log(colors.red("   l*S  S*b       d*S  S*S         S*b     S*S   `S%b     d*S     l*S  "));
    console.log(colors.red("  .S*P  S*S.     .S*S  S*S         S*S.    S*S    S%S    .S*S    .S*P  "));
    console.log(colors.red("sSS*S    SSSbs_sdSSS   S*S          SSSbs  S*S    S&S  sdSSS   sSS*S   "));
    console.log(colors.red("YSS'      YSSP~YSSY    S*S           YSSP  S*S    SSS  YSSY    YSS'    "));
    console.log(colors.red("                       SP                  SP                          "));
    console.log(colors.red("                       Y                   Y                           \n"));
  },

  //inititalize log utility
  initLogger: function() {

    var LogEngine = require('superjs-logger');
    this.log = new LogEngine(this);
  },

  //load application configuration
  loadConfiguration: function() {

    //setup configuration object
    this.config = {};

    //attempt to load the package json
    if( fs.existsSync(this.appPath + '/package.json') ) {
      this.config.package = require(this.appPath + '/package.json');
    } else {
      console.error('A package.json is required (' + this.appPath + '/package.json' + ')');
      process.exit();
    }

    //set default configuration path
    this.configPath = '/configuration';

    //detect environment path
    if( fs.existsSync(this.appPath+this.configPath+'/environment.js') ) {
      this.configPath = require(this.appPath+this.configPath+'/environment')();
    }

    this.log.info('configuration path:', this.configPath);

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

    //update the logger configuration
    this.log.configure(this.config.server.logger);

  },

  //setup list of middleware to load
  enableMiddleware: function() {

    //maintain reference to instance
    var self = this;

    this.middleware = [

      //enable cross origin resource sharing
      self.enableCors,

      //bind middleware to initialize response object
      self.enableResponse,

      //enable the body parser
      self.enableBodyParser,

      //enable the superjs router
      self.enableRouter
    ];
  },

  //attach middleware to the express application pipeline
  loadMiddleware: function() {

    //loop through middleware and execute methods to bind them to express
    for( var i in this.middleware ) {
      this.middleware[i].apply(this);
    }

  },

  //attach CORS (cross origin resource sharing) middleware
  enableCors: function() {

    var cors = require('cors');
    this.express.use(cors());

  },

  //attach response middleware
  enableResponse: function() {

    //maintain reference to instance
    var self = this;

    this.express.use(function(req, res, next) {
      self.initResponse(req, res, next);
    });

  },

  //attach body parser middleware
  enableBodyParser: function() {

    var bodyParser = require('body-parser');
    var multer = require('multer');

    //maintain reference to instance
    var self = this;

    //parse body for json
    this.express.use(bodyParser.json());

    //parse body for application/x-www-form-urlencoded data
    this.express.use(bodyParser.urlencoded({extended: true}));

    //parse body for multipart/form-data
    this.express.use(multer());

    //handle errors from body parser
    this.express.use(function(err, req, res, next) {
      //set the response status based on the error
      res.status(err.status);

      //if 4**, assume invalid body, else unknown.
      if( err.status >= 400 && err.status < 500 ) {

        self.setResponse({meta: {success: false}, errors: [{"id": "invalid_body", status: err.status, message: "The body of your request is invalid."}]}, res);

        self.sendResponse(req, res);

      } else {
        self.setResponse({meta: {success: false}, errors: [{"id": "server_error", status: err.status, message: "The server encountered an unknown error."}]}, res);
        self.sendResponse(req, res);
      }
    });
  },

  //attach the superjs router middleware
  enableRouter: function() {

    //maintain reference to self
    var self = this;

    this.express.use(function(req, res) {
        self.router(req, res);
    });

  },

  //load additional service libraries
  loadServices: function() {

    //maintain referecne to instance
    var self = this;

    if( fs.existsSync(self.appPath + '/services') ) {

      //get list of services
      var services = fs.readdirSync(self.appPath + '/services');

      //load each service
      services.map(function(serviceName) {

        //make sure the controller exists
        if (fs.existsSync(self.appPath + '/services/' + serviceName + '/service.js')) {

          var Service = require(self.appPath + '/services/' + serviceName + '/service');

          if (Service) {
            self.loadService(serviceName, Service);
          }
        }

      });

      this.log.info('services loaded:',Object.keys(this.services));

    }
  },

  //load the service
  loadService: function(serviceName, Service) {

    //instantiate the service
    var service = new Service(this);

    //assign a name, if one is not assigned
    if( !service.name) {
      service.name = serviceName;
    }

    //make the controller available to the application
    this.services[service.name] = service;
  },

  //load controllers by going through module folders
  loadControllers: function() {

    //maintain reference to self
    var self = this;

    //load application controller
    this.controllers.application = this;
    this.controllers.application.blueprint = {actions:{}};

    if( fs.existsSync(self.appPath + '/modules') ) {

      //get list of modules
      var modules = fs.readdirSync(self.appPath + '/modules');

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

    }

    this.log.info('controllers loaded:',Object.keys(this.controllers));
  },

  //load the controller
  loadController: function(controllerName, Controller) {

    //instantiate the controller
    var controller = new Controller(this);

    //assign a name, if one is not assigned
    if( !controller.name) {
      controller.name = controllerName;
    }

    //make the controller available to the application
    this.controllers[controller.name] = controller;
    this.externalMethods[controller.name] = {};

  },

  //build controller method maps
  buildMethodMap: function() {

    var firstCharacter = '';
    var methodName = '';

    //setup application controller
    this.externalMethods['application'] = {};

    //loop through controllers
    for( var controllerName in this.controllers ) {

      //loop through methods
      for( var method in this.controllers[controllerName] ) {

        //we only want functions
        if( method !== '_super' && typeof this.controllers[controllerName][method] === 'function' ) {

          //capture the first character of the method name
          firstCharacter = method.substr(0,1);

          //underscores or capital letters signify external methods
          if(firstCharacter === '_') {

            methodName = method.substr(1, method.length - 1);
            this.externalMethods[controllerName][methodName] = method;

          } else if(firstCharacter === firstCharacter.toUpperCase() && firstCharacter !== firstCharacter.toLowerCase() ) {

            methodName = firstCharacter.toLowerCase() + method.substr(1, method.length - 1);
            this.externalMethods[controllerName][methodName] = method;

          }

        }
      }

    }
  },

  //load blueprints for controllers
  loadBlueprints: function() {

    //maintain reference to self
    var self = this;

    if( fs.existsSync(self.appPath + '/modules') ) {

      //get list of modules
      var modules = fs.readdirSync(self.appPath + '/modules');

      //load each controller
      modules.map(function(moduleName) {
        self.loadBlueprint(moduleName, null, 'modules/' + moduleName);
      });

    }
  },

  //deep merge controller blueprint so they inherit from base controller blueprints
  loadBlueprint: function(controllerName, blueprints, blueprintPath) {

    //maintain a list of loaded blueprints at each depth
    blueprints = (blueprints) ? blueprints : [];

    //determine the path if this is the first iteration or a nested blueprint
    if( blueprintPath ) {
      blueprintPath = this.appPath + '/' + blueprintPath;
    } else  {
      blueprintPath = this.appPath + '/' + blueprints[blueprints.length - 1].extends;
    }

    //see if the blueprint actually exists at the given path
    if (fs.existsSync(blueprintPath + '/blueprint.js')) {

      //load the blueprint
      var loadedBlueprint = require(blueprintPath + '/blueprint');

      //add the blueprint to the depth list
      blueprints.push(loadedBlueprint);

      //recursively execute this method if the blueprint extends another
      if( loadedBlueprint.extends ) {
        return this.loadBlueprint(controllerName, blueprints);
      }
    }

    //setup blueprint on the controller
    this.controllers[controllerName].blueprint = {};

    //progressively merge changes from the base up to the outermost blueprint (overwriting changes)
    for( var i = blueprints.length - 1; i >= 0; i-- ) {
      this.controllers[controllerName].blueprint = merge(blueprints[i], this.controllers[controllerName].blueprint);
    }

    var blueprint = this.controllers[controllerName].blueprint;

    //make sure the actions object exists on the blueprint
    if( !blueprint.actions  ) {
      this.log.warn('blueprint missing actions:', controllerName);
      blueprint.actions = {};
    }

    //add missing external methods to blueprint to avoid further checks
    for( var method in this.externalMethods[controllerName] ) {

      if( !blueprint.actions[method] ) {
        this.log.warn('blueprint missing action:', controllerName + "." + method);
        blueprint.actions[method] = {params: {}};
      }
    }

    //loop through actions for this blueprint
    for( var action in blueprint.actions ) {

      //loop through parameters for each action
      for( var param in blueprint.actions[action].params ) {

        //if transforms have been specified for this parameter
        if( blueprint.actions[action].params[param].transform ) {

          //loop through each transform
          for( var transform in blueprint.actions[action].params[param].transform ) {

            //warn & remove any transforms, validations, or sanitizations that don't exist
            if( !this.services.transform[transform] ) {

              this.log.warn('transform missing:',transform);
              delete blueprint.actions[action].params[param].transform[transform];

            } else {
              //set to actual method for transform as a shortcut
              //blueprint.actions[action].params[param].transform[transform] = this.services.transform[transform];
            }
          }
        } else {
          this.log.warn('blueprint missing transform:',controllerName + "." + action + "." + param);
          blueprint.actions[action].params[param].transform = {};
        }

        //if validations have been specified for this parameter
        if( blueprint.actions[action].params[param].validate ) {

          //loop through each transform
          for( var validation in blueprint.actions[action].params[param].validate ) {

            //warn & remove any transforms, validations, or sanitizations that don't exist
            if( !this.services.validate[validation] ) {

              this.log.warn('validation missing:',validation);
              delete blueprint.actions[action].params[param].validate[validation];
            }
          }
        } else {
          blueprint.actions[action].params[param].validate = {};
        }

        //if sanitzations have been specified for this parameter
        if( blueprint.actions[action].params[param].sanitize ) {

          //loop through each transform
          for( var sanitization in blueprint.actions[action].params[param].sanitize ) {

            //warn & remove any transforms, validations, or sanitizations that don't exist
            if( !this.services.sanitize[sanitization] ) {

              this.log.warn('sanitization missing:',sanitization);
              delete blueprint.actions[action].params[param].sanitize[sanitization];
            }
          }
        } else {
          blueprint.actions[action].params[param].sanitize = {};
        }
      }
    }

    //this.log.debug('blueprint loaded for '+controllerName+':',blueprint);

  },

  //initialize database engine
  initConnections: function() {

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

  //initialize the response object
  initResponse: function(req, res, next) {

    //log access
    this.log.access(req.method+' '+req.path+' '+req.ip, req.body);

    var response = {meta:{name: this.config.package.name, version: this.config.package.version}};

    //initialize response object
    this.setResponse(response, res);

    //set the request start time
    req.startTime = new Date();

    //proceed to next request process
    return next();

  },

  //configure method chain for requests
  router: function(req, res) {

    //maintain reference to instance
    var self = this;

    //determine the controller and action
    self.processRequest(req)

      //authenticate the request
      .then(function() {
        return self.authenticateRequest(req);
      })

      //execute the request
      .then(function() {
        return self.handleRequest(req, res);
      })

      //send response
      .then(function() {
        return self.sendResponse(req, res);
      })

      //handle any errors
      .catch(function(err) {

        self.log.error('An unexpected error occured while executing a request:');
        self.log.object(err);
        if( err.stack ) {
          self.log.break();
          self.log.object(err.stack);
        }

        self.log.break();
        self.setResponse({meta:{success: false}, errors:[err]}, res, err.status);
        self.sendResponse(req,res);

      });
  },

  //override this to manipulate the request
  beforeAction: function(req) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  },

  //todo: refactor & move application controller into actual controller class
  //configure default response
  Default: function(req) {

    return new Promise(function(resolve, reject) {

      resolve({meta:{success: true}});

    });

  },

  //configure API describe response
  Describe: function(req) {

    //maintain reference to instance
    var self = this;

    return new Promise(function(resolve, reject) {
      //init response object
      var response = {meta:{success: true}};

      //add external method map to the response
      response.controllers = self.externalMethods;

      resolve(response);

    });

  },

  //process request for REST & RPC methods
  processRequest: function(req) {

    //maintain reference to instance
    var self = this;

    //return promise
    return new Promise(function(resolve, reject) {

      var path = req.path.split('/');

      if( path.length > 1 ) {

        //Handle Application & REST Resource Routes
        if( path.length == 2 ) {

          if(_.isEmpty(path[1]) ) {

            req.controller = 'application';
            req.action = 'default';

          } else if( path[1] === 'describe' ) {

            req.controller = 'application';
            req.action = 'describe';

          } else {

            req.actionType = 'REST';

            if (path[1] in self.controllers) {

              //set controller name
              req.controller = path[1];

              //check to see if this controller is rest enabled
              if (self.controllers[req.controller].restEnabled) {

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
          }

          //handle RPC routes
        } else if( path.length >= 3 ) {

          req.actionType = 'RPC';

          //check if controller exists
          if( path[1] in self.controllers ) {

            //set the controller name
            req.controller = path[1];

            //check if action exists on controller
            if( path[2] in self.externalMethods[path[1]]) {

              //set the action name
              req.action = path[2];
            }

          }
        }

        //reject if the requested controller doesn't exist
        if( !req.controller ) {
          return reject(new SuperJS.Error('controller_not_found', 404, 'Controller not found.'));
        }

        //reject if the requested action doesn't exist
        if( !req.action ) {
          if( req.actionType === 'REST' )
            return reject(new SuperJS.Error('method_not_found', 404, 'REST Controller method '+req.method+' invalid.'));
          else
            return reject(new SuperJS.Error('method_not_found', 404, 'Controller RPC method '+req.method+' not found.'));
        }

        self.log.info('routing request:',{controller: req.controller, action: req.action});
        resolve();
      } else {

        reject(new SuperJS.Error('malformed_request', 500, 'Something went wrong trying to process your request.'));

      }

    });

  },

  //check authentication
  authenticateRequest: function(req) {

    //maintain reference to self
    var self = this;

    //return promise
    return new Promise(function(resolve, reject) {

      //check if authentication is enabled
      if( !self.config.security.enabled ) {
        return resolve();
      }

      //check if the requested action is public
      if( self.controllers[req.controller].public && _.contains(self.controllers[req.controller].public, req.action) ) {

        return resolve();

      } else {

        self.log.info('authenticating request...');

        //determine controller name for auth
        var controllerName = ( self.config.security.controllerName ) ? self.config.security.controllerName : 'user';

        //make sure the _authorize method has been implemented on the auth controller
        if( !self.controllers[controllerName] || !self.controllers[controllerName].authorize ) {

          self.log.error("The " + controllerName + " controller's authorize method has not been implemented.");
          return reject(new SuperJS.Error('authorize_not_configured', 500, "The " + controllerName + " controller's _authorize method has not been implemented."));

        }

        //execute authorize method on the auth controller
        self.controllers[controllerName].authorize(req, function(err, user) {

          if( err || !user) {

            //if there was an error or the user was not found return failure
            return reject(new SuperJS.Error('authentication_failed', 403, "Authentication failed."));

          } else {

            //otherwise continue to process request
            return resolve();
          }

        });

      }

    });
  },

  //execute request
  handleRequest: function(req, res) {

    //maintain reference to instance
    var self = this;

    //emit beforeAction events for secondary procedures
    self.controllers[req.controller].emit('beforeAction', req);
    self.controllers[req.controller].emit('before' + req.action.substr(0,1).toUpperCase() + req.action.substr(1, req.action.length - 1), req);

    //call before action method
    return self.controllers[req.controller].beforeAction(req)

      //update the response object
      .then(function(response) {
        self.setResponse(response, res);
      })

      //execute parameter transforms
      .then(function() {
        return self.controllers[req.controller].transform(req);
      })

      //execute parameter validations
      .then(function() {
        return self.controllers[req.controller].validate(req);
      })

      //execute parameter sanitizations
      .then(function() {
        return self.controllers[req.controller].sanitize(req);
      })

      //execute the requested action
      .then(function() {
        return self.controllers[req.controller][self.externalMethods[req.controller][req.action]](req);
      })

      //update the response object
      .then(function(response) {
        self.setResponse(response, res);
      })

      //call the after action method
      .then(function() {
        return self.controllers[req.controller].afterAction(req);
      })

      //update the response object
      .then(function(response) {
        self.setResponse(response, res);
      })

      //emit afterAction events for secondary procedures
      .then(function() {
        self.controllers[req.controller].emit('afterAction', req, res.response);
        self.controllers[req.controller].emit('after'+req.action.substr(0,1).toUpperCase()+req.action.substr(1,req.action.length-1), req);
      });

  },

  //merge object onto res.response
  setResponse: function(obj, res, status) {

    if( !obj )
      return;

    if( !res.response )
      res.response = {};

    //extend response object with obj
    res.response = merge(res.response, obj);

    //set response status if set
    if( status ) {
      res.status(status);
    }

  },

  //override this to manipulate the request
  afterAction: function(req) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  },

  //send response
  sendResponse: function(req, res) {

    //maintain reference to instance
    var self = this;

    return new Promise(function(resolve, reject) {

      //calculate request time
      var endTime = new Date();
      var requestDuration = endTime - req.startTime;
      res.response.meta.duration = requestDuration + 'ms';

      self.log.info('request duration:',{duration: requestDuration, unit:'ms'});
      self.log.break();

      //send response
      res.json(res.response);

      resolve();

    });

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
