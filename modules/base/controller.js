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

  //execute tranforms sequentially
  transform: function(req) {

    //maintain reference to instance
    var self = this;

    //return promise
    return new Promise(function(resolve, reject) {

      var transforms = [];

      //loop through all the parameters for this action
      for( var param in self.blueprint.actions[req.action].params ) {

        //loop through transforms for each parameter
        for( var transform in self.blueprint.actions[req.action].params[param].transform ) {

          self.app.log.debug('executing "' + transform + '" transform on:',param);

          //execute transform & reject on error)
          transforms.push(self.app.services.transform[transform](req,param));

        }
      }

      //TODO: use 'each' instead to ensure sequential execution?
      Promise.all(transforms)
        .then(function(){
          resolve();
        })
        .catch(function(err) {
          reject();
        });

    });
  },

  //execute validations in parallel
  validate: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {

      var validations = [];

      //loop through all the parameters for this action
      for( var param in self.blueprint.actions[req.action].params ) {

        //loop through transforms for each parameter
        for( var validation in self.blueprint.actions[req.action].params[param].validate ) {

          self.app.log.debug('executing "' + validation + '" validation on:',param);

          //execute transform & reject on error)
          validations.push(self.app.services.validate[validate](req,param));

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

  //TODO: execute sanitizations in parallel
  sanitize: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {

      var sanitizations = [];

      //loop through all the parameters for this action
      for( var param in self.blueprint.actions[req.action].params ) {

        //loop through transforms for each parameter
        for( var sanitization in self.blueprint.actions[req.action].params[param].sanitize ) {

          self.app.log.debug('executing "' + sanitization + '" sanitization on:',param);

          //execute transform & reject on error)
          sanitizations.push(self.app.services.sanitize[sanitization](req,param));

        }
      }

      Promise.all(sanitizations)
        .then(function(){
          resolve();
        })
        .catch(function(err) {
          reject();
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