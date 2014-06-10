/*
 ** SuperJS Starter App **
 */

//require dependencies
var SuperJS = require('superjs');

//instantiate the application
var App = new SuperJS.Application();

//bind to server started event
App._on('started', function() {

  console.log('\nApplication Started...\n');

});

//start the server
App.start();
