/**
 * @module API
 * @submodule Controller
 */

var Class = require('superjs-base');
var Promise = require('bluebird');

/**
 * The base controller class is used to provide the basic building block the API controllers.
 *
 * @exports Controller
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = Class.extend({

  init: function(app) {

    //store reference to express
    this.app = app;

    //maintain reference to self
    var self = this;

  },

  //can be overridden by the controller extension to manipulate the request or response
  beforeAction: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {
      console.log('before action...');
      resolve({beforeAction: true});
    });

  },

  //can be overridden by the controller extension to manipulate the request or response
  afterAction: function(req, response, next) {

    //return promise
    return new Promise(function(resolve, reject) {
      console.log('after action...');
      resolve({afterAction: true});
    });
  }

});