/**
 * Use the environment configuration hook to determine the path
 * of your configuration files.
 * For example, you could return a static configuration path, or
 * return a subdirectory path based on the hostname or an environment variable.
 * The path is based on the project root and should start with a forward slash
 * and end without one.
 */
module.exports = function() {

  return '/config/dev';

};
