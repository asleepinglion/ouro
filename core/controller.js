/*
 * Controller *
 * the base controller class used by API controllers *
 */

//require dependencies
var Class = require('superjs-base');

module.exports = Class.extend({

  init: function(app) {

    //store reference to express
    this.app = app;

    //maintain reference to self
    var self = this;

  },

  beforeAction: function(req, next) {

    //can be overridden by the controller extension to manipulate the request or response
    next({});

  },

  afterAction: function(req, response, next) {

    //can be overridden by the controller extension to manipulate the request or response
    next({});
  }

});