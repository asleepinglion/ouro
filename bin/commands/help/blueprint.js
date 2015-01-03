/**
 * SuperJS Server Command Blueprint
 * Start a SuperJS Server...
 *
 * @exports {object}
 */

module.exports = {

  command: 'help',

  description: 'Get help with SuperJS commands and their options.',

  default: true,

  params: {

    command: {
      description: 'The command for which you want more information.',
      type: 'string'
    }

  }

};