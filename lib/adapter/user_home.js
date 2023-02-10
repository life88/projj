'use strict';

module.exports = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
