#!/usr/bin/env node
/* eslint-disable no-console */

const Commonconfig  = require('cccommon/config');

const Logging = require('cccommon/logging').logger('test_app_insights');
Logging.enable();

const id = require('uuid/v4')();

const details = {
  id: id,
  top_level_obj: {
    some_array: [1,2],
    some_string: 'cc',
    nested_obj: {
      some_array: [3,4],
      some_string: 'CC'
    }
  }
};

const key = Commonconfig.logging.appinsights_instrumentation_key();
const message = `test_app_insights event message ${id}`;
const detailsStr = JSON.stringify(details, null, 2);

console.log(`Instrumentation Key [${key}]\nExpected Trace Message [${message}]\nExpected Trace Details:\n${detailsStr}`);
Logging.msg(message, details);
