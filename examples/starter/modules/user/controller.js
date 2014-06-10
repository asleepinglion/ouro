/*
 * UserController *
 * Controller for the User Resource
 *
 * @exports UserController
 */

//require dependencies
var SuperJS = require('superjs');

module.exports = SuperJS.CrudController.extend({

  name: 'user',

  _init: function(app) {

    //call bass class constructor
    this._super(app);

    //bind events to trigger secondary procedures
    this._on('beforeAction', function(req) {

    });

    //the afterAction event gets sent the response, but if you want to manipulate the
    //response object, you need to override the afterAction method instead
    this._on('afterAction', function(req, response) {

    });

  },

  //example: override beforeAction method
  _beforeAction: function(req, done) {

    //the object passed to done will get merged into the response object
    done({});
  }

});