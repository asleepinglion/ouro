"use strict";

var Class = require('superjs-base');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var merge = require('recursive-merge');
var Promise = require('bluebird');

module.exports = Class.extend({

  init: function() {

    if( typeof this._super === 'function') {
      this._super.apply(this, arguments);
    }

    //add methods to the execute ignore to avoid wrapping meta functions
    this._executeIgnore = this._executeIgnore.concat(['_metaFile','_processMeta', '_loadMeta']);

    //load meta data
    if( typeof this._metaFile === 'function' ) {
      this._metaFile.apply(this);
    }

    //process meta data
    if( typeof this.meta === 'object' ) {
      this._processMeta();
    }

  },

  //load a meta file and merge on top of current meta data
 _loadMeta: function(filePath) {

    if( path.extname(filePath) === '.js' ) {
      filePath = path.dirname(filePath);
    }

    //console.log(colors.gray('loading meta:'), filePath);

    this.filePath = filePath;

    var meta = require(filePath + '/meta');

    //set the name of the class to the last name value
    this.name = meta.name;

    if( typeof this.meta === 'object' ) {
      this.meta = merge(meta, this.meta);
    } else {
      this.meta = meta;
    }
  },

  //process & sanitize meta data
  _processMeta: function() {

    //if the name was not set by the last meta file set it based on the file path
    if( (!this.name || this.name === 'Class') && typeof this.filePath === 'string' ) {
      this.name = path.basename(this.filePath);
    }

    //make sure the meta object exists
    if( typeof this.meta !== 'object' ) {
      console.log(colors.gray('class meta:'), 'not found!');
      this.meta = {};
    }

    //make sure the meta methods object exists
    if( typeof this.meta.methods !== 'object' ) {
      console.log(colors.yellow('class meta:'), 'missing methods object!');
      this.meta.methods = {};
    }

    //loop through methods in the meta object
    for( var method in this.meta.methods ) {

      //delete any method from meta that does not actually exist on the class
      if( !(method in this) ) {
        console.log(colors.yellow('class missing method:'), {class: this.name, method: method});
        delete this.meta.methods[method];
      }

    }

    /*
    //loop through methods in the class
    for( var method in this ) {

      if( typeof this[method] === 'function' ) {

        //alert about methods missing from the meta data
        if (!(method in this.meta.methods)) {
          console.log(colors.yellow('meta missing method:'), {class: this.name, method: method});
        }

      }
    }
    //*/

  },

  _execute: function(name, fn, args) {

    //maintain reference to instance
    var self = this;

    //if async is enabled, wrap method execution in a bluebird promise
    if( typeof this.meta === 'object' &&
      typeof this.meta.methods === 'object' &&
      typeof this.meta.methods[name] === 'object' &&
      typeof this.meta.methods[name].async === 'boolean' &&
      this.meta.methods[name].async === true ) {

      //wrap the method in a promise
      return new Promise(function (resolve, reject) {

        //prepend resolve and reject callbacks to arguments
        args = Array.prototype.slice.call(args);
        args.unshift(reject);
        args.unshift(resolve);

        //todo: process arguments using parameter integrity checks
        //this.processArgs(args);

        fn.apply(self, args);

      });

    } else {

      return fn.apply(self, args);

    }
  }

});
