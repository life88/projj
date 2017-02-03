'use strict';

const BaseProgram = require('common-bin').Program;

class Program extends BaseProgram {
  constructor() {
    super();
    this.version = require('../package.json').version;
    this.addCommand('init', require.resolve('./init_command'));
    this.addCommand('add', require.resolve('./add_command'));
    this.addCommand('run', require.resolve('./run_command'));
  }
}

module.exports = Program;