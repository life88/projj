#!/usr/bin/env node

const path = require('pathe');

console.log('%s hook, cwd %s', process.argv[2], path.resolve(process.cwd()));
try {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  console.log('%s hook, get package name %s', process.argv[2], pkg.name);
} catch (_) {
}
