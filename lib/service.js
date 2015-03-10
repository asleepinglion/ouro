"use strict";

var SuperJS = require('../index');


/**
 * The base service class is the basic building block for services.
 *
 * @exports Service
 * @namespace SuperJS
 * @extends SuperJS.Class
 */

module.exports = SuperJS.Class.extend({

  init: function(app, config) {

    //maintain reference to instance
    var self = this;

    return new Promise(function(resolve, reject) {

      if( typeof app !== 'object' ) {
        return reject(new SuperJS.Error('invalid_application', 'The application provided was not valid.'));
      }

      if( typeof config !== 'object' ) {
        return reject(new SuperJS.Error('invalid_config', 'The configuration provided was not valid.'));
      }

      //maintain reference to the application instance
      this.app = app;

      //maintain a reference to the configuration
      this.config = config;

    });

  }

});
