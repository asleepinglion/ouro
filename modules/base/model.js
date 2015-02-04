
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

    //maintain a reference to the log engine
    this.log = app.log;

  },

  processConfiguration: function() {

    if( this.attributes ) {

      for( var attribute in this.attributes ) {

        if( !this.attributes[attribute].validate ) {
          this.attributes[attribute].validate = {};
        }

        if( !this.attributes[attribute].sanitize ) {
          this.attributes[attribute].sanitize = {};
        }

        if( this.attributes[attribute].type ) {
          this.attributes[attribute].validate[this.attributes[attribute].type] = true;
        }

        //warn & remove any missing validations
        for( var validation in this.attributes[attribute].validate ) {
          if( !this.app.services.validate[validation] ) {
            this.log.warn('validation missing:',{validation: validation, model: this.name});
            delete this.attributes[attribute].validate[validation];
          }
        }

        //warn & remove any missing sanitizations
        for( var sanitization in this.attributes[attribute].sanitize ) {
          if( !this.app.services.sanitize[sanitization] ) {
            this.log.warn('sanitization missing:',{sanitization: sanitization, model: this.name});
            delete this.attributes[attribute].sanitize[sanitization];
          }
        }

      }

    } else {

      this.log.warn('model missing attributes object...');

    }

  },

  validate: function(req) {
  },

  sanitize: function(req) {
  }

});
