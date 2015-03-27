"use strict";

var Class = require('superjs-base');
var Meta = require('../meta/class');
var Modules = require('../modules/class');
var EventEmitter = require('events').EventEmitter;

module.exports = Class.extend(EventEmitter, Meta, Modules, {

  init: function() {

    //load essential modules that all classes should be able to use
    this.loadModule('console-log', { build: { subModule: __dirname, shortcut: 'log'}, boot: { objectDepth: 5 } });
    this.loadModule('transform', { build: { subModule: __dirname, shortcut: 'transform' }});
    this.loadModule('validate', { build: { subModule: __dirname, shortcut: 'validate' }});

  },

  _metaFile: function() {
    this._loadMeta(__filename);
  },

  //get value by searching the object tree for the name path provided
  get: function(name) {

    var namePath = name.split('.');

    var property = this;

    for( var i = 0; i < namePath.length; i++ ) {

      property = property[namePath[i]]

      if( typeof property === 'undefined' ) {
        return undefined;
      } else if( i === namePath.length - 1 ) {
        return property;
      }

    }

  },

  //set property at a variable path with the value provided
  set: function(name, value) {

    //console.log('setting ' + name + ':', value);

    var namePath = name.split('.');

    var property = this;

    for( var i = 0; i < namePath.length; i++ ) {

      property = property[namePath[i]]

      if( namePath.length === 0 ) {

        //must be a path of some kind
        return false;

      } else if( namePath.length === 1 ) {

        ///set the value and return
        this[name] = value;
        return true;

      } else if( namePath.length > 1 && i < (namePath.length - 1) ) {

        //create object if it doesn't exist along the path
        if( typeof property === 'undefined' ) {
          property = {};
        }

      } else if( i === (namePath.length - 1) ) {
        property = value;
        return true;
      }

    }
  }

});