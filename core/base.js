/**
 * Simple JavaScript Inheritance Inspired by base2 and Prototype.
 * MIT Licensed.
 * Adapted to work as NodeJS module
 *
 * @link    http://ejohn.org/blog/simple-javascript-inheritance/
 * @author  John Resig
 * @author  Augusto Pascutti
 * @author  Daniel Schwartz
 * @author  Aaron Storck
 */

var EventEmitter = require('events').EventEmitter;

var initializing = false,
  fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
var Class = function(){};

// Create a new Class that inherits from this class
Class.extend = function(prop) {

  var _super = this.prototype;

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  initializing = true;
  var prototype = new this();
  initializing = false;

  // Copy the properties over onto the new prototype
  for (var name in prop) {

    // Check if we're overwriting an existing function
    prototype[name] = typeof prop[name] == "function" &&
      typeof _super[name] == "function" && fnTest.test(prop[name]) ?
      (function(name, fn){
        return function() {
          var tmp = this._super;

          // Add a new ._super() method that is the same method
          // but on the super-class
          this._super = _super[name];

          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          var ret = fn.apply(this, arguments);
          this._super = tmp;

          return ret;
        };
      })(name, prop[name]) :
      prop[name];
  }

  // The dummy class constructor
  function Class() {
    // All construction is actually done in the init method
    if ( !initializing && this._init )
      this._init.apply(this, arguments);
  }

  // Populate our constructed prototype object
  Class.prototype = prototype;
  // Enforce the constructor to be what we expect
  Class.constructor = Class;
  // And make this class extendable
  Class.extend = arguments.callee;
  return Class;
};

//Create new class for SuperJS EventEmitter
var SuperEventEmitter = function() {};

//Internalize Event Emitter methods
for( var prop in EventEmitter.prototype ) {
  if( typeof EventEmitter.prototype[prop] === 'function')
    SuperEventEmitter.prototype['_'+prop] = EventEmitter.prototype[prop];
  else
    SuperEventEmitter.prototype[prop] = EventEmitter.prototype[prop];
}

//Add class extension
SuperEventEmitter.extend = Class.extend;

//export base class
module.exports = SuperEventEmitter;

