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

  options: {

    snapshot: {
      description: 'Record snapshots of requests & responses.',
      aliases: ['s']
    },

    watch: {
      aliases: ['w'],
      description: 'Watch files for changes and either reload or rebuild project.',
      default: 'reload',
      validate: {
        in: ['reload', 'rebuild']
      }
    },

    mode: {
      description: 'The server mode affects how the server behaves for varioius parts of the lifecycle.',
      type: 'string',
      default: 'dev',
      validate: {
        in: ['dev', 'development', 'beta', 'staging', 'prod', 'production']
      }
    }
  }

};