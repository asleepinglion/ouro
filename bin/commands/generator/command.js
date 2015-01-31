/**
 * SuperJS Generate
 * Generate files for your SuperJS application
 */

var SuperJS = require('../../../index');
SuperJS.Command = require('superjs-cli').Command;

var fs = require('fs');
var path = require('path');
var colors = require('colors');

module.exports = SuperJS.Command.extend({

  run: function() {

    //maintain reference to instance
    var self = this;

    return new Promise(function(resolve, reject) {

      self.log.debug('generating:', self.app.request.options.type);

    });
  },

  createResource: function(name) {
    this.createController(name);
    this.createModel(name);
  },

  createController: function(name) {

  },

  createModel: function(name) {

  }

});

