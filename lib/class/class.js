"use strict";

var Class = require('superjs-base');
var Meta = require('../meta/class');
var Loader = require('../loader/class');
var GetSet = require('../getset/class');
var EventEmitter = require('events').EventEmitter;

module.exports = Class.extend(EventEmitter, GetSet, Meta, Loader, {

  _metaFile: function() {
    this._loadMeta(__filename);
  },

  init: function() {

    //create global superjs object if one does not exist
    if( !global.superjs ) {
      global.superjs = {};
    }

    //load essential modules that all classes should be able to use
    this._load('env', { setup: { modulePath: this._modulePath(__dirname), alias: 'env'} });
    this._load('path', { setup: { modulePath: this._modulePath(__dirname), alias: 'paths'} });
    this._load('config', { setup: { modulePath: this._modulePath(__dirname), alias: 'configs'} });
    this._load('console', { setup: { modulePath: this._modulePath(__dirname), alias: 'log'} });
    this._load('transform', { setup: { modulePath: this._modulePath(__dirname), alias: 'transform' }});
    this._load('validate', { setup: { modulePath: this._modulePath(__dirname), alias: 'validate' }});

  }

});
