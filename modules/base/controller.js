"use strict";

var SuperJS = require('../../index');

var Promise = require('bluebird');
var path = require('path');

/**
 * The base controller class is the basic building block for controllers.
 *
 * @exports Controller
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = SuperJS.Class.extend({

  init: function(app) {

    //store reference to the application instance
    this.app = app;

  },

  //can be overridden by the controller extension to manipulate the request or response
  beforeAction: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {
      resolve({});
    });

  },

  //verify the request by transforming, validating, and sanitizing parameters
  verifyRequest: function(req) {

    //maintain reference to the currrent instance
    var self = this;

    //return promise which is resolved or rejected depending on completion
    return new Promise(function (resolve, reject) {

      //self.app.log.debug('request body:', req.body);

      //maintain context object of parameters
      var parameters = {};

      //maintain list of closures which contain promises for each process
      var transforms = [];
      var validations = [];
      var sanitizations = [];
      var modelValidations = [];

      //loop through all the parameters for this action and
      //append transforms, validations, and sanitizations to their respective lists
      for (var param in self.blueprint.actions[req.action].params) {

        //store the parameters value
        parameters[param] = req.param(param);

        //set value to default if its not passed
        if( typeof parameters[param] === 'undefined' ) {
          parameters[param] = self.blueprint.actions[req.action].params[param].default;
        }

        //setup transforms
        transforms = transforms.concat(
          self.app.services.transform.setup(
            self.blueprint.actions[req.action].params[param].transform, parameters, param)
        );

        //setup validations
        validations = validations.concat(
          self.app.services.validate.setup(
            self.blueprint.actions[req.action].params[param].validate, parameters, param, 'parameter')
        );

        //setup sanitizations
        //sanitizations = sanitizations.concat(self.app.services.sanitize.setup(self.blueprint.actions[req.action].params[param].sanitize, parameters, param));

        //if the the parameter is a model, process attribtue transforms, validations, & sanitizations
        if( self.blueprint.actions[req.action].params[param].model ) {

          //if there are validations for this model and
          if( Object.keys(self.blueprint.actions[req.action].params[param].model.validate).length > 0 &&

            //the parameter has not been passed
            typeof parameters[param] !== 'undefined') {

              //loop through model validations
              for (var attribute in self.blueprint.actions[req.action].params[param].model.validate) {

                //if defaults are enabled for this action's model and
                if( self.blueprint.actions[req.action].params[param].model.defaults === true &&

                  //the attribute was not provided
                  Object.keys(parameters[param]).indexOf(attribute) === -1) {

                    //set the value of the attribute to it's specified default
                    parameters[param][attribute] = self.app.models[self.name].attributes[attribute].defaultsTo;
                }

                //execute validations if the attribute is required or
                if( self.blueprint.actions[req.action].params[param].model.validate[attribute].required === true ||

                  //if the attribute has been provided
                  typeof parameters[param][attribute] !== 'undefined') {

                    modelValidations = modelValidations.concat(
                      self.app.services.validate.setup(
                        self.blueprint.actions[req.action].params[param].model.validate[attribute],
                        parameters[param],
                        attribute,
                        'attribute'
                      )
                    );
                }

              }

          }
        }
      }

      //self.app.log.debug('parameters:', parameters);

      var numberOfValidations = validations.length + modelValidations.length;
      self.app.log.debug("performing " + transforms.length + " transforms, " + numberOfValidations + " validations, and " + sanitizations.length + " sanitizations...");

      //exceute transforms
      self.app.services.transform.process(transforms)

        //execute validations
        .then(function() {
          return self.app.services.validate.process(validations);
        })

        //exectute sanitizations
        //.then(function() {
        //  return self.services.sanitize.process(sanitizations)
        //})

        //execute validations
        .then(function() {
          return self.app.services.validate.process(modelValidations);
        })

        //resolve if all passed without errors
        .then(function() {

          //store the parameters on the request object
          req.parameters = parameters;
          self.app.log.debug('verified parameters:', parameters);

          resolve();
        })

        //reject if we caught any errors
        .catch(function(err) {

          reject(err);
        });

    });

  },

  //get a parameter's value after tranforms, validations, and sanitizations are complete
  parameter: function(req, param) {

    var context = undefined;

    param = param.split('.');

    for( var i = 0; i < param.length; i++ ) {

      if( i === 0 ) {

        if( typeof req.parameters !== 'object' || typeof req.parameters[param[0]] === 'undefined' ) {
          break;
        }

        context = req.parameters[param[0]];
      } else {
        context = context[param[i]];
      }

    }

    return context;

  },

  Describe: function(req) {

    //maintain reference to instance
    var self = this;

    //return promise to resolve or reject
    return new Promise(function(resolve, reject) {

      //package response
      var response = {meta: {success: true}, blueprint: self.blueprint};

      //resolve response
      resolve(response);

    });

  },

  //can be overridden by the controller extension to manipulate the request or response
  afterAction: function(req, response) {

    //return promise
    return new Promise(function(resolve/*, reject*/) {
      resolve({});
    });
  }

});