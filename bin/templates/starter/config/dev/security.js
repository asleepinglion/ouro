/*
 * Security Configuration *
 *
 */

"use strict";

module.exports = {

  //enable or disable api security
  enabled: false,

  //name of the controller which has auth methods
  //controllerName: 'user',

  //security secret used for creating tokens
  secret: '',

  //token expiration length in seconds
  tokenExpiration: 1800

};
