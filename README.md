**Work in progress**

## Summary
AWS Lambda when attached to an SQS queue, it won't wait for messages. It will always try to process that many messages as many instances it can spin up for it self (based on the concurrency config). The rest of the messages will be throttled.

Initially I added a 1000 times redrive policy which allowed me to do that (hackish) but now we want to take advantage of the retrying mechanism.

This is our solution to create a sequential processing pipeline on a serverless environment.

## How
To create a pipeline that will consume and process one message at a time, we need to do the following

- Have a Lambda function that consumes one message from an SQS and processes it
- Once done, this function will call it self, if runs and doesn't fund a message, it will just stop
- Have that function wake up every minute through Cloudwatch alarms

So basically, we create a sequential process pipeline.

## Refs
https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html
https://stackoverflow.com/questions/51202756/aws-lambda-sqs-trigger-throttle-limit
