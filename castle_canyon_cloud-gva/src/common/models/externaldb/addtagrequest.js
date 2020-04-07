'use strict';

module.exports.addTagRequestSchema = {
  cloudReceivedTime: Number,
  gatewayTime: Number,
  messageType: String,
  gatewayId: String,
  tagId: String,
};

// Add Tag Request Class
module.exports.addTagRequest = function addTagRequest() {
  this.cloudReceivedTime = Date.now();
  this.gatewayTime = Date.now();
  this.messageType = 'addTagRequest';
  this.tagId;
  this.gatewayId;
};