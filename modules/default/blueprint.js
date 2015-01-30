/**
 * The Default Blueprint describes the methods of the controller.
 */

module.exports = {

  description: 'The default controller provides standard default methods for the root level of the API server.',

  actions: {

    default: {
      description: "The default provides a basic response to allow you to determine whether the API is available."
    },

    describe: {

      description: "The describe method allows you to reflect the API's controllers & models.",
      params: {

        extensions: {
          description: 'Choose whether to show blueprint extension paths.',
          type: 'boolean',
          default: false,
          transform: {
            boolean: true
          }
        },
        controllers: {
          description: 'Choose whether to return controllers.',
          type: 'boolean',
          default: true,
          transform: {
            boolean: true
          }
        },
        actions: {
          description: 'Choose whether to return actions.',
          type: 'boolean',
          default: false,
          transform: {
            boolean: true
          }
        },
        params: {
          description: 'Choose whether to return parameters.',
          type: 'boolean',
          default: false,
          transform: {
            boolean: true
          }
        },
        models: {
          description: 'Choose whether to return models.',
          type: 'boolean',
          default: true,
          transform: {
            boolean: true
          }
        },
        attributes: {
          description: 'Choose whether to return attributes.',
          type: 'boolean',
          default: false,
          transform: {
            boolean: true
          }
        },
        transforms: {
          description: 'Choose whether to return transforms.',
          type: 'boolean',
          default: false
        },
        validations: {
          description: 'Choose whether to return validations.',
          type: 'boolean',
          default: false,
          transform: {
            boolean: true
          }
        },
        sanitizations: {
          description: 'Choose whether to return sanitizations.',
          type: 'boolean',
          default: false,
          transform: {
            boolean: true
          }
        },
        descriptions: {
          description: 'Choose whether to return descriptions.',
          type: 'boolean',
          default: true,
          transform: {
            boolean: true
          }
        },

      }
    }
  }

};