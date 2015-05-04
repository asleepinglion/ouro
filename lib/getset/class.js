
var Class = require('superjs-base');

module.exports = Class.extend({

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
