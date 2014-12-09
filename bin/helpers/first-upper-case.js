/**
 * Helper to uppercase the first character of a word
 */

module.exports = function(word) {
  return word.substr(0,1).toUpperCase()+word.substr(1,word.length-1);
};