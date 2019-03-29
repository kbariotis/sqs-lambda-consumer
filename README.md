## Summary
How to create a sequential pipeline of processing messages with AWS SQS and Lambda.

## Why
AWS Lambda, when attached to an SQS queue [through an event source](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-eventsource), it won't wait for messages. It will always try to process that many messages as many instances it can spin up for it self (based on the concurrency config). The rest of the messages will be throttled.

This is a solution to create a sequential processing pipeline on a serverless environment.

## How
To create a pipeline that will consume and process one message at a time, we need to do the following:

- Have a Lambda function that consumes one message from an SQS and processes it
- Once done, this function will call it self, if runs and doesn't find a message, it will just quit
- Have that function wake up every minute through Cloudwatch alarms

Consider the following timeline:

- 12:00:00 - Function wakes up, finds no messages
- 12:00:10 - Someone feeds the queue with 1000 messages
- 12:01:00 - Function wakes up, fetches 10 messages and tries to process them
           - When done, it will call it self again until it drains the queue
- 12:01:** - Function calls it self, processes another 10 messages
- 12:02:00 - Function wakes up, throttles because an instance is running already (configurable)
- 12:02:** - Function calls it self, processes another 10 messages
- 12:03:00 - Function wakes up, throttles because an instance is running already (configurable)
- 12:03:** - Function calls it self, processes another 10 messages
- 12:03:** - Function calls it self, processes another 10 messages
- 12:04:00 - Function wakes up, throttles because an instance is running already (configurable)
- 12:04:** - Function calls it self, processes another 10 messages


## Links
https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html
https://stackoverflow.com/questions/51202756/aws-lambda-sqs-trigger-throttle-limit
