/**
 * Helper to camel case words
 */

module.exports = function(word) {
  return word.charAt(0).toLowerCase() + word.substr(1);
};