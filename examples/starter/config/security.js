/*
 * Security Configuration *
 *
 * Use the security configuration to manage the security of your application:
 *
 */

module.exports = {

  //enable or disable passport authentication
  enabled: true,

  //pass in the strategy class
  type: 'basic',
  strategy: require('passport-http').BasicStrategy,

  //set strategy options
  options: {session: false},

  //provide the validator method used to authenticate
  validator: function(username, password, done) {

    console.log('checking credentials...');

    this.models['user'].findOne()
      .where({
        or: [{email: username }, {phone: username } ],
        passwordHash: password
      })
      .then(function(user) {
        if (!user) { return done(null, false, {message: "The credentials you provided were not valid."}); }
        return done(null, user);
      })
      .fail(function(err) {
        return done(null, false, {message: "An error occurred trying to authenticate."});
      });
  }

};