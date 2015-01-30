"use strict";

var SuperJS = require('../../index');
var Promise = require('bluebird');


/**
 * The default controller provides default routes for the application
 *
 * @exports Controller
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = SuperJS.Controller.extend({

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

      //if enabled, return a copy of the completely mapped controllers & their blueprints
      if( req.parameters.controllers ) {

        //create a controllers object for the response
        response.controllers = {};

        for( var controller in self.app.controllers ) {

          //copy the blueprint for the controller
          response.controllers[controller] = JSON.parse(JSON.stringify(self.app.controllers[controller].blueprint));

          //remove the blueprint extensions from the response if disabled
          if( req.parameters.extensions === false ) {
            delete response.controllers[controller].extends;
          }

          //remove the controller description from the response if disabled
          if( req.parameters.descriptions === false ) {
            delete response.controllers[controller].description;
          }

          //remove actions from the response if disabled
          if( req.parameters.actions === false ) {

            delete response.controllers[controller].actions;

          } else {

            for( var action in response.controllers[controller].actions ) {

              //remove internal method names
              delete response.controllers[controller].actions[action]._method;

              //remove the parameters from the response if disabled
              if( req.parameters.params === false ) {
                delete response.controllers[controller].actions[action].params;
              }

            }
          }

        }

      }

      if( req.parameters.models ) {

        //create a models object for the response
        response.models = {};

        for( var model in self.app.models ) {

          //setup model object
          response.models[model] = {};

          //copy the description
          response.models[model].description = self.app.models[model].description;

          //copy the attributes for the model
          response.models[model].attributes = JSON.parse(JSON.stringify(self.app.models[model].attributes));

          //remove the model description from the response if disabled
          if( req.parameters.descriptions === false ) {
            delete response.models[model].description;
          }

          //remove attributes from the response if disabled
          if( req.parameters.attributes === false ) {

            delete response.models[model].attributes;

          } else {

            for( var attribute in response.models[model].attributes ) {

              //remove the parameters from the response if disabled
              if( req.parameters.transforms === false ) {
                delete response.models[model].attributes[attribute].transform;
              }

              //remove the parameters from the response if disabled
              if( req.parameters.validations === false ) {
                delete response.models[model].attributes[attribute].validate;
              }

              //remove the parameters from the response if disabled
              if( req.parameters.sanitizations === false ) {
                delete response.models[model].attributes[attribute].sanitize;
              }

            }
          }

        }

      }

      resolve(response);

    });

  },


});