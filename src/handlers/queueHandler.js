
const Promise = require('bluebird');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

const queueUrl = process.env.EXAMPLE_QUEUE_URL;

/**
 * This function will process one message from the queue
 *
 * @param {Object} message
 * @returns {Promise}
 */
async function messageHandler(message) {
  console.log(`Processing message ${message.item}`);
}

/**
 * This is an abstract Lambda worker that is responsible for
 * draining out an SQS queue.
 *
 * It will fetch one message from an SQS queue, hand it down
 * to the passed function, either delete it if it succeeds and
 * then call it self.
 */
return async function lambdaHandler(payload, context) {
  const payload = await sqs
    .receiveMessage({
      AttributeNames: [],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: [
        'All'
      ],
      QueueUrl: queueUrl,
      VisibilityTimeout: 15,
      WaitTimeSeconds: 0
    })
    .promise();

  if (!payload.Messages || (payload.Messages && !payload.Messages.length)) {
    return;
  }

  await Promise.each(payload.Messages, async (message) => {
    // By default, delete every message after processing
    // unless it throw an error and we catch it
    let shouldDeleteMessage = true;

    try {
      await messageHandler(message);
    } catch (e) {
      console.log(`Error while processing message: ${message.ReceiptHandle}`);
      console.log(`${e.message}`);

      shouldDeleteMessage = false;
    }

    if (shouldDeleteMessage) {
      await sqs.deleteMessage({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
      }).promise();
    }
  })
    // Call the same Lambda function again
    // The next invocation will fetch the next 10 messages
    // from the queue.
    .then(() => lambda.invokeAsync({
      FunctionName: context.functionName,
      InvokeArgs: '{}'
    }).promise());
};

module.exports = { handler };
