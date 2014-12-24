/**
 * SuperJS Generator Command Blueprint
 * Generate SuperJS files, methods, & other resources.
 *
 * @exports {object}
 */

modules.export = {

  command: 'generate',

  description: 'Generate SuperJS files, methods, & other resources.',

  aliases: ['new','gen'],

  options: {

    databaseEngine: {

      aliases: ['db'],
      description: 'The database engine lets you use any database backend or orm you desire.',
      params: {

        mode: {
          in: ['waterline', 'thinky'],
          defaultsTo: ''
        }

      }
    }

  },

  params: {

    type: {
      description: 'The type of object you wish to create.',
      type: 'string',
      in: ['resource','controller','model', 'method', 'action'],
      required: true
    },

    name: {
      description: 'The name of the object you wish to create.',
      type: 'string',
      required: true
    }
  }
};