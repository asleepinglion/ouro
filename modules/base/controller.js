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
  verify: function(req) {

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

      //loop through all the parameters for this action and
      //append transforms, validations, and sanitizations to their respective lists
      for (var param in self.blueprint.actions[req.action].params) {

        //store the parameters value
        parameters[param] = req.param(param);

        //setup transforms
        transforms = transforms.concat(self.app.services.transform.setup(self.blueprint.actions[req.action].params[param].transform, parameters, param));

        //setup validations
        validations = validations.concat(self.app.services.validate.setup(self.blueprint.actions[req.action].params[param].validate, param, parameters[param]));

        //setup sanitizations
        //sanitizations = sanitizations.concat(self.app.services.sanitize.setup(self.blueprint.actions[req.action].params[param].sanitize, parameters, param));

      }

      self.app.log.debug("performing " + transforms.length + " transforms, " + validations.length + " validations, and " + sanitizations.length + " sanitizations...");

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


  //can be overridden by the controller extension to manipulate the request or response
  afterAction: function(req, response, next) {

    //return promise
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  }

});