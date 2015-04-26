"use strict";

var Class = require('superjs-base');

module.exports = Class.extend({

  init: function(code, message, additional) {

    //maintain reference to instance
    var self = this;

    this.code = code;
    this.message = message;

    if( typeof additional === 'object') {

      //copy all properties of this object and its prototype chain
      for( var property in additional ) {
        this[property] = additional[property];
      }

      //make sure we get non-enumerable object properties
      Object.getOwnPropertyNames(additional).map(function(property) {
        self[property] = additional[property];
      });
    }

    if( !this.stack ) {
      this.stack = new Error(message).stack;
    }

  }


});
