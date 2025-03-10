// Promise polyfill for IE and others.
if (process.browser && typeof Promise !== 'function') {
  global.Promise = require('pinkie')
}

var test = require('tape')
var memdown = require('memdown')
var encode = require('encoding-down')
var levelup = require('../lib/levelup')

var testCommon = require('./common')({
  test: test,
  factory: function (options) {
    return levelup(encode(memdown(), options))
  },
  clear: true,
  deferredOpen: true,
  promises: true,
  streams: true,
  encodings: true
})

require('./argument-checking-test')(test, testCommon)
require('./batch-test')(test, testCommon)
if (testCommon.encodings) require('./binary-test')(test, testCommon)
if (testCommon.clear) require('./clear-test')(test)
if (testCommon.snapshots) require('./create-stream-vs-put-racecondition')(test, testCommon)
if (testCommon.deferredOpen) require('./deferred-open-test')(test, testCommon)
require('./get-put-del-test')(test, testCommon)
require('./idempotent-test')(test, testCommon)
require('./init-test')(test, testCommon)
if (testCommon.encodings) require('./custom-encoding-test')(test, testCommon)
if (testCommon.encodings) require('./json-encoding-test')(test, testCommon)
if (testCommon.streams) require('./key-value-streams-test')(test, testCommon)
require('./maybe-error-test')(test, testCommon)
require('./no-encoding-test')(test, testCommon)
require('./null-and-undefined-test')(test, testCommon)
if (testCommon.deferredOpen) require('./open-patchsafe-test')(test, testCommon)
if (testCommon.streams) require('./read-stream-test')(test, testCommon)
if (testCommon.snapshots) require('./snapshot-test')(test, testCommon)
require('./iterator-test')(test, testCommon)
if (testCommon.seek) require('./iterator-seek-test')(test, testCommon)

if (!process.browser) {
  require('./browserify-test')(test)
}
