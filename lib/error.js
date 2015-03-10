"use strict";

var SuperJS = require('../index');

/**
 * A simple error class for SuperJS.
 *
 * @exports Error
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

Error.extend = SuperJS.Class.extend;

module.exports = Error.extend({

  init: function(code, message, additional) {

    //maintain reference to instance
    var self = this;

    this.code = code;
    this.message = message;

    if( additional ) {

      //copy all properties of this object and its prototype chain
      for( var property in additional ) {
        this[property] = additional[property];
      }

      //make sure we get non-enumerable object properties
      Object.getOwnPropertyNames(additional).map(function(property) {
        self[property] = additional[property];
      });
    }

  },



});
