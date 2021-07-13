# Shopify App Lambda Functions

## List of Lambda Functions
|Functions|URL|Description|
|--------|--------|--------|
|consumer|<N/A - triggered by SQS>|Subscribe new event from SQS > Backendless|
|consumerHTTP|/|Insert new shopify order information > Backendless|
|airtableReplicator|<N/A - triggered by SQS>|Subscribe new event from SQS > Airtable|

## Development
### Pre-requisites
- [Install serverless CLI in your local machine](https://www.serverless.com/framework/docs/getting-started/)
- [Set PTTB AWS configuration in your local machine](https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

### How to run offline
- `sls offline`

### How to deploy
- `sls deploy --aws-profile <name of your preferred AWS profile in your local machine>`
