/*
 * Database Configuration
 *
 * You can use the database configuration to setup connections to
 * multiple data sources using whatever data engine/layer you choose.
 *
 * @param engine: You need to set the data engine and also make sure to include
 * the appropriate npm package, i.e. for 'thinky' (rethink ORM), you need superjs-thinky,
 * or to use sail.js' 'waterline' orm, you need superjs-waterline
 *
 * The particular settings are dependent on the engine used. Although there is an
 * effort to keep things consistent, there are differences in orms & client
 * libraries that make absolute consistency impractical. See the readme for the
 * engine library for specific settings.
 *
 *
 */

module.exports = {

  //set the engine to use
  engine: 'thinky',

  //configure connections
  connections: {

    //you can call the connections whatever you like
    default: {

      //these settings map directly into thinky the lite ORM used by the superjs-rethink
      db: 'test',
      host: '127.0.0.1',
      port: 28015
    }
  }

};