/*
 * Controller *
 * the base controller class used by API controllers *
 */

//require dependencies
var Class = require('./base');

module.exports = Class.extend({

  init: function(app) {

    //store reference to express
    this.app = app;

    //maintain reference to self
    var self = this;

  },

  beforeAction: function(req, callback) {

    //can be overridden by the controller extension to manipulate the request or response
    callback({});

  },

  afterAction: function(req, response, callback) {

    //can be overridden by the controller extension to manipulate the request or response
    callback({});
  }

});