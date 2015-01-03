/**
 * SuperJS Server Command Blueprint
 * Start a SuperJS Server...
 *
 * @exports {object}
 */

module.exports = {

  command: 'up',

  description: 'Start a SuperJS Server!',

  aliases: ['lift','start'],

  flags: {

    snapshot: {
      description: 'Record snapshots of requests & responses.',
      aliases: ['s']
    },

    watch: {
      aliases: ['w'],
      description: 'Watch files for changes and either reload or rebuild project.',

      params: {

        mode: {
          description: 'The mode determines what happens when changes are detected.',
          in: ['reload', 'rebuild'],
          defaultsTo: 'reload'
        }

      }
    }
  },

  params: {

    mode: {
      description: 'The type of object you wish to create.',
      type: 'string',
      defaultsTo: 'dev',
      in: ['dev', 'development', 'beta', 'staging', 'prod', 'production']
    }

  }

};