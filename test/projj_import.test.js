'use strict';

const path = require('pathe');
const coffee = require('coffee');
const mm = require('mm');
const rimraf = require('mz-modules/rimraf');
const runscript = require('runscript');
const mkdirp = require('mz-modules/mkdirp');
const fs = require('mz/fs');

const binfile = path.join(__dirname, '../bin/projj.js');
const fixtures = path.join(__dirname, 'fixtures');
const tmp = path.join(fixtures, 'tmp');
const repo = path.join(fixtures, 'importdir/repo');
const home = path.join(fixtures, 'base-tmp');
const target = path.join(tmp, 'github.com/popomore/projj');
const USER_HOME = require('../lib/adapter/user_home');

describe('test/projj_import.test.js', () => {

  beforeEach(() => {
    mm(process.env, USER_HOME, home);
  });
  afterEach(mm.restore);
  afterEach(() => rimraf(tmp));
  afterEach(() => rimraf(path.join(repo, '.git')));

  describe('when origin url exists', () => {
    before(function* () {
      yield runscript('git init && git remote add origin https://github.com/popomore/projj.git', {
        cwd: repo,
      });
    });

    it('should import from it', function* () {
      yield coffee.fork(binfile, [ 'import', path.join(fixtures, 'importdir') ])
      // .debug()
        .expect('stdout', /importing repository https:\/\/github.com\/popomore\/projj.git/)
        .expect('stdout', new RegExp(`Cloning into ${target}`))
        .expect('stdout', /preadd/)
        .expect('stdout', /postadd/)
        .expect('code', 0)
        .end();
    });
  });

  describe('when origin url is unknown', () => {
    before(function* () {
      yield runscript('git init && git remote add origin https://unknown.com/popomore/projj.git', {
        cwd: repo,
      });
    });

    it('should fail to clone', function* () {
      yield coffee.fork(binfile, [ 'import', path.join(fixtures, 'importdir') ])
      // .debug()
        .expect('stdout', /importing repository https:\/\/unknown.com\/popomore\/projj.git/)
        .expect('stderr', /Fail to clone https:\/\/unknown.com\/popomore\/projj.git/)
        .expect('code', 0)
        .end();
    });
  });

  describe('when no origin url', () => {
    before(function* () {
      yield runscript('git init', {
        cwd: repo,
      });
    });

    it('should fail to clone', function* () {
      yield coffee.fork(binfile, [ 'import', path.join(fixtures, 'importdir') ])
      // .debug()
        .notExpect('stdout', /importing repository https:\/\/unknown.com\/popomore\/projj.git/)
        .expect('code', 0)
        .end();
    });
  });

  describe('when target exists', () => {
    before(function* () {
      yield runscript('git init && git remote add origin https://github.com/popomore/projj.git', {
        cwd: repo,
      });
    });
    before(() => mkdirp(target));

    it('should ignore', function* () {
      yield coffee.fork(binfile, [ 'import', path.join(fixtures, 'importdir') ])
      // .debug()
        .expect('stdout', /importing repository https:\/\/github.com\/popomore\/projj.git/)
        .expect('stderr', new RegExp(`${target} exists`))
        .expect('code', 0)
        .end();
    });
  });

  describe('when repo under node_modules', () => {
    const repo = path.join(fixtures, 'importdir/repo2/node_modules/repo');
    before(function* () {
      yield runscript('git init && git remote add origin https://github.com/popomore/projj-hooks.git', {
        cwd: repo,
      });
    });
    after(() => rimraf(path.join(repo, '.git')));

    it('should ignore', function* () {
      yield coffee.fork(binfile, [ 'import', path.join(fixtures, 'importdir') ])
      // .debug()
        .notExpect('stdout', /importing repository https:\/\/github.com\/popomore\/projj-hooks.git/)
        .expect('code', 0)
        .end();
    });
  });

  describe('when --cache', () => {
    const cacheFile = path.join(home, '.projj/cache.json');

    before(function* () {
      yield fs.writeFile(cacheFile, JSON.stringify({
        [path.join(tmp, 'github.com/popomore/projj')]: {
          repo: 'https://github.com/popomore/projj.git',
        },
      }));
    });
    after(function* () {
      yield rimraf(cacheFile);
    });

    it('should import from it', function* () {
      yield coffee.fork(binfile, [ 'import', '--cache' ])
        // .debug()
        .expect('stdout', /importing repository https:\/\/github.com\/popomore\/projj.git/)
        .expect('stdout', new RegExp(`Cloning into ${target}`))
        .expect('stdout', /preadd/)
        .expect('stdout', /postadd/)
        .expect('code', 0)
        .end();
    });
  });

});
