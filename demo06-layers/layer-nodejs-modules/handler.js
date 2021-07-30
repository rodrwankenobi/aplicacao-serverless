'use strict';

module.exports.hello = async (event) => {
  const moment = require('moment')
  return {
    statusCode: 200,
    body: moment().format()
  };
};
