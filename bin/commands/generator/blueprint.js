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

    dbEngine: {

      aliases: ['db'],
      description: 'The database engine lets you use any database backend or orm you desire.',
      params: {

        mode: {
          validate: {
            in: ['waterline', 'thinky'],
            defaultsTo: ''
          }
        }

      }
    }

  },

  params: {

    type: {
      description: 'The type of object you wish to create.',
      type: 'string',
      in: ['project', 'resource', 'controller', 'model', 'method', 'action'],
      required: true
    },

    name: {
      description: 'The name of the object you wish to create.',
      type: 'string',
      required: true
    }
  }
};