/**
 * Command registry
 */

const commands = {
  help: require('./help'),
  info: require('./info'),
  ping: require('./ping'),
  about: require('./about'),
  support: require('./support')
};

module.exports = commands;
