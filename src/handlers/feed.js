const Promise = require('bluebird');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

const queueUrl = process.env.EXAMPLE_QUEUE_URL;

// Generate number of messages and
// create batches of length
const noOfMessages = 1000;
const batchLength = 10;

/**
 * Returns an array with arrays of the given size.
 *
 * @param array {Array} Array to split
 * @param size {Integer} Size of every group
 */
function chunkArray(array, size) {
  const results = [];

  while (array.length) {
    results.push(array.splice(0, size));
  }

  return results;
}

/**
 * @param {Object} payload
 * @param {Object} context
 */
function handler(payload, context) {
  // Generate an array of messages
  const array = [];
  for (let i = 0; i < noOfMessages; i += 1) {
    array.push({
      item: i
    });
  }

  // Create batches to feed to SQS
  const batches = chunkArray(array, batchLength);

  await Promise.each(batches, (batch) =>
    sqs.sendMessageBatch({
      QueueUrl: queueUrl,
      Entries: batch.map(item => ({
        MessageBody: JSON.stringify(item),
        Id: Math.random().toString(36).substr(2, 10) // Quick random alphanumeric
      }))
    }).promise()
  );
}

module.exports = { handler };
