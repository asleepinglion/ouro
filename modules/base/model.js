
"use strict";

var SuperJS = require('../../index');

/**
 * The base model class is the basic building block for models in database engines.
 * They come bottled with methods to validate and sanitize attributes.
 *
 * @exports Model
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = SuperJS.Class.extend({

  init: function (app) {

    //maintain a reference to the app
    this.app = app;
  },

  validate: function(req) {

    //maintain reference to the instance
    var self = this;

    //return promise
    return new Promise(function(resolve, reject) {

      var validations = [];

      //loop through all the parameters for this action
      for( var attribute in self.attributes ) {

        //loop through transforms for each parameter
        for( var validation in self.blueprint.actions[req.action].params[param].validate ) {

          self.app.log.debug('executing "' + validation + '" validation on:',param);

          var validation = self.app.services.validate[validate];
          var options = self.blueprint.actions[req.action].params[param].validate[validation];
          var value = req.params(param);

          //todo: load the blueprints for services
          //var rule = self.app.services.validate.blueprint[validate].rule;

          //execute transform & reject on error)
          validations.push(function() {
            return new Promise(function(resolve,reject) {
              if( validation.apply(null, value, options) ) {
                resolve();
              } else {
                reject(new SuperJS.Error('validation_error', 422, 'A validation error occured.'));
              }
            });
          });

        }
      }

      Promise.all(validations)
        .then(function(){
          resolve();
        })
        .catch(function(err) {
          reject();
        });
    });

  },

  sanitize: function(req) {

  }

});
