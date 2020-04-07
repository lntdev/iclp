'use strict';

module.exports.addTagResponseSchema = {
  time: Number,
  messageType: String,
  gatewayId: String,
  tagId: String,
  handle : String
};

// Add Tag Response Init Class
module.exports.addTagResponse = function addTagResponse() {
  this.time;
  this.messageType = 'addTagResponse';
  this.tagId;
  this.gatewayId;
  this.handle;
};
