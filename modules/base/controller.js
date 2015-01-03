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

  //TODO: execute tranforms sequentially
  transform: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  },

  //TODO: execute validations in parallel
  validate: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  },

  //TODO: execute sanitizations in parallel
  sanitize: function(req) {

    //return promise
    return new Promise(function(resolve, reject) {
      resolve({});
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