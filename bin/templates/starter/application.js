/**
 * @module API
 * @submodule Application
 */

"use strict";

var SuperJS = require('superjs');

/**
 * The API is the central data request engine for business logic.
 *
 * @class {{upper-camel-case projectName}}
 * @constructor
 * @namespace {{upper-camel-case projectName}}
 * @extends SuperJS.Application
 */

module.exports = SuperJS.Application.extend({

  init: function() {
    this._super();
    this.on('started', this.displayEmblem);
  },

  //show emblem when the application is ready
  displayEmblem: function() {

    console.log('\nApplication Started...\n');

  }

});
