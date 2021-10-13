const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_ACCOUNT_REGION
});

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const accountId = process.env.AWS_ACCOUNT_ID;

const sendMessageToQueue = (queueName, messageBody) => {
    const params = {
        MessageBody: JSON.stringify(messageBody),
        QueueUrl: `https://sqs.${process.env.AWS_ACCOUNT_REGION}.amazonaws.com/${accountId}/${queueName}`
    };
    sqs.sendMessage(params, (err, data) => {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Successfully added message", data.MessageId);
        }
    });
}

module.exports = {
    sendMessageToQueue
}
