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

    //store reference to express
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
        if( !parameters[param] ) {
          parameters[param] = self.blueprint.actions[req.action].params[param].default;
        }

        //setup transforms
        transforms = transforms.concat(self.app.services.transform.setup(self.blueprint.actions[req.action].params[param].transform, parameters, param));

        //setup validations
        validations = validations.concat(self.app.services.validate.setup(self.blueprint.actions[req.action].params[param].validate, param, parameters[param], 'parameter'));

        //setup sanitizations
        //sanitizations = sanitizations.concat(self.app.services.sanitize.setup(self.blueprint.actions[req.action].params[param].sanitize, parameters, param));

        if( self.blueprint.actions[req.action].params[param].model ) {

          //if the parameter is a model but the value is null/undefined, default parameter to empty object
          if( Object.keys(self.blueprint.actions[req.action].params[param].model.validate).length > 0 && !parameters[param]) {
            parameters[param] = {};
          }

          //loop through model validations
          for( var attribute in self.blueprint.actions[req.action].params[param].model.validate ) {

            //set attribute value to default if its not passed
            if( Object.keys(parameters[param]).indexOf(attribute) === -1 ) {
              parameters[param][attribute] = self.app.models[self.name].attributes[attribute].defaultsTo;
            }

            //don't run validations if the attribute has not been provided and its not required
            if( self.blueprint.actions[req.action].params[param].model.validate[attribute].required === true || typeof parameters[param][attribute] !== 'undefined' ) {
              modelValidations = modelValidations.concat(self.app.services.validate.setup(self.blueprint.actions[req.action].params[param].model.validate[attribute], attribute, parameters[param][attribute], 'attribute'));
            }

          }

        }
      }

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
  afterAction: function(req, response, next) {

    //return promise
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  }

});