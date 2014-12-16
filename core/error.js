/**
 * @module API
 * @submodule Error
 */

var Class = require('superjs-base');

/**
 * A simple error class for SuperJS.
 *
 * @exports Error
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

Error.extend = Class.extend;

module.exports = Error.extend({

  init: function(code, status, message) {
    this.code = code;
    this.status = status;
    this.message = message;
  }

});
