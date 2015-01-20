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

      //add external method map to the response
      response.controllers = self.app.externalMethods;

      resolve(response);

    });

  },


});