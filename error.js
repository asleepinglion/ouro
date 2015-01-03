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

  init: function(code, status, message) {
    this.code = code;
    this.status = status;
    this.message = message;
  }

});
