
const Promise = require('bluebird');

const queueUrl = process.env.EXAMPLE_QUEUE_URL;

async function messageHandler(message) {
  console.log('Process message');
}

/**
 * This is an abstract Lambda worker that is responsible for draining
 * out an SQS queue.
 *
 * It will fetch one message from an SQS queue, hand it down to the
 * passed function, either delete it if it succeeds and then call it self.
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
    .then(() => lambda.invokeAsync({
      FunctionName: context.functionName, // Call itself
      InvokeArgs: '{}'
    }).promise());
};

module.exports = { handler };
