/**
 * SuperJS Generator Command Blueprint
 * Generate SuperJS files, methods, & other resources.
 *
 * @exports {object}
 */

module.exports = {

  command: 'generate',

  description: 'Generate SuperJS files, methods, & other resources.',

  aliases: ['new', 'gen'],

  options: {

    waterline: {
      aliases: ['w']
    },

    dbEngine: {
      aliases: ['e'],
      description: 'The database engine lets you use any database backend or orm you desire.',
      default: 'waterline',
      validate: {
        in: ['waterline', 'thinky']
      }
    },

    type: {
      aliases: ['t'],
      description: 'The type of object you wish to create.',
      type: 'string',
      validate: {
        in: ['project', 'resource', 'controller', 'model', 'method', 'action'],
        required: true
      }
    },

    name: {
      aliases: ['n'],
      description: 'The name of the object you wish to create.',
      type: 'string',
      validate: {
        required: true
      }
    }
  }

};