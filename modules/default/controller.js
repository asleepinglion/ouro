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

  /**
   * Describe the API using blueprints & models for reflection.
   */

  Describe: function(req) {

    //maintain reference to instance
    var self = this;

    return new Promise(function(resolve, reject) {

      //init response object
      var response = { meta: { success: true } };

      //localize the options parameter
      var options = req.parameters.options;

      //if controllers are enabled
      if( options.controllers === true || typeof options.controllers === 'object' ) {

        //create a controllers object for the response
        response.controllers = {};

        //loop through the loaded controllers
        for ( var controller in self.app.controllers ) {

          //copy the blueprint for the controller
          response.controllers[controller] = JSON.parse(JSON.stringify(self.app.controllers[controller].blueprint));

          if( typeof options.controllers === 'object' ) {
            self.pruneObject(options.controllers, response.controllers[controller], controller);
          }

        }
      }

      //if models are enabled
      if( options.models === true || typeof options.models === 'object' ) {

        //create a controllers object for the response
        response.models = {};

        //loop through the loaded controllers
        for ( var model in self.app.models ) {

          //console.log(self.app.models[model]);

          //setup the model
          response.models[model] = {};

          //copy the model description
          response.models[model].description = self.app.models[model].description;

          //copy the model connection
          response.models[model].connection = self.app.models[model].connection;

          //copy the model attributes
          response.models[model].attributes = JSON.parse(JSON.stringify(self.app.models[model].attributes));

          if( typeof options.models === 'object' ) {
            self.pruneObject(options.models, response.models[model], model);
          }

        }
      }

      resolve(response);

    });
  },

  pruneObject: function(options,context,contextName) {

    //loop through context properties and delete based on options
    for( var property in context) {

      //console.log(contextName, property, typeof options[property], typeof context, context);

      //if the property is false or undefined on the options, delete it
      if( typeof options[property] === 'undefined' || options[property] === false ) {

        delete context[property];

      } else if( typeof options[property] === 'object') {

        for( var subProperty in context[property] ) {
          this.pruneObject(options[property],context[property][subProperty],"." + contextName + "." + property + "." + subProperty);
        }

      }
    }

  }


  /*
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
              } else {

                for( var param in response.controllers[controller].actions[action].params ) {

                  //remove the parameters from the response if disabled
                  if( req.parameters.transforms === false ) {
                    delete response.controllers[controller].actions[action].params[param].transform;
                  }

                  //remove the parameters from the response if disabled
                  if( req.parameters.validations === false ) {
                    delete response.controllers[controller].actions[action].params[param].validate;
                  }

                  //remove the parameters from the response if disabled
                  if( req.parameters.sanitizations === false ) {
                    delete response.controllers[controller].actions[action].params[param].sanitize;
                  }

                  if( req.parameters.models === false && typeof response.controllers[controller].actions[action].params[param].model === 'object' ) {
                    response.controllers[controller].actions[action].params[param].model = true;
                  }
                }

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

  */


});