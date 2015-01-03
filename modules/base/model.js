
"use strict";

var SuperJS = require('../../index');

/**
 * The base model class is the basic building block for models in database engines.
 * They come bottled with methods to validate and sanitize attributes.
 *
 * @exports Model
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = SuperJS.Class.extend({

  init: function (app) {

    //maintain a reference to the app
    this.app = app;
  },

  validate: function() {

  },

  sanitize: function() {

  }

});
