"use strict";

var SuperJS = require('./index');

/**
 * A simple error class for SuperJS.
 *
 * @exports Error
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

Error.extend = SuperJS.Class.extend;

module.exports = Error.extend({

  init: function(code, status, message, additional) {

    this.code = code;
    this.status = status;
    this.message = message;

    if( additional ) {
      for( var property in additional ) {
        this[property] = additional[property];
      }
    }

  }

});
