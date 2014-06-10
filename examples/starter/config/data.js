/*
 * Database Configuration
 *
 * You can use the database configuration to setup connections to
 * multiple data sources. The data layer is provided by the Waterline
 * ORM (part of the Sails.JS architecture).
 */

module.exports = {

  //set default options for all connections
  defaults: {
    migrate: "safe"
  },

  adapters: {
    mysql: require('sails-mysql')
  },

  //describe connections (adapters must be installed)
  connections: {

    db1: {
      adapter: "mysql",
      database: "db1",
      user: "username",
      password: "password",
      host: "127.0.0.1",
      port: 3306,
      pool: true
    }

  }

};