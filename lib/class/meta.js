module.exports = {

  name: 'Class',
  description: 'The base class is the essential building block for SuperJS applications.',

  methods: {

    init: {
      description: 'The init method is the constructor for the class.'
    },

    get: {
      description: 'The default get method allows you to quickly get a value at a specified path (e.g. object.x).'
    },

    set: {
      description: 'The default set method allows you to quickly save a value at a specified path (e.g. object.x).'
    },

    _metaFile: {
      description: 'The meta file method is the hook that classes can use to load meta data via _loadMeta.'
    },

    _loadMeta: {
      description: 'The load meta method loads a meta file from a specified path and merges data onto existing data.'
    },

    _processMeta: {
      description: 'The process meta method checks and sanitizes the meta data.'
    },

    _modulePath: {
      description: 'Get a modules path from a nested class path.'
    },

    _load: {
      description: 'The load class method allows any class to load classes into the local or global namespace.'
    },

    _class: {
      description: 'The get module method attempts to find a class in either the local or global namespace.'
    }

  }
};
