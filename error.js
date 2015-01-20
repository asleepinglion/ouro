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

  init: function(code, status, message, properties) {
    this.code = code;
    this.status = status;
    this.message = message;

    if( properties ) {
      for( var property in properties ) {
        this[property] = properties[property];
      }
    }
  }

});
