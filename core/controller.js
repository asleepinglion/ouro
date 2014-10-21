/*
 * Controller *
 * the base controller class used by API controllers *
 */

//require dependencies
var Class = require('./base');

module.exports = Class.extend({

  _init: function(app) {

    //store reference to express
    this.app = app;

    //maintain reference to self
    var self = this;

  },

  _beforeAction: function(req, callback) {

    //can be overridden by the controller extension to manipulate the request or response
    callback({});

  },

  _afterAction: function(req, response, callback) {

    //can be overridden by the controller extension to manipulate the request or response
    callback({});
  }

});