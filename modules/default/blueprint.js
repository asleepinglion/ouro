/**
 * The Default Blueprint describes the methods of the controller.
 */

module.exports = {

  description: 'The default controller provides a basic set of methods for the API server.',

  actions: {

    default: {
      description: "The default action returns the status of the API."
    },

    describe: {

      description: "The describe method reflects the available services, controllers, and models.",
      params: {

        //todo: use options parameter object with merge transform
        options: {
          description: "An object expression which denotes what properties to return.",
          type: "object",
          default: {
            controllers: true,
            models: true
          },
          transform: {
            object: true
          }
        }

      }
    }
  }

};