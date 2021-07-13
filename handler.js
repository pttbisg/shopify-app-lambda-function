const axios = require('axios');
const _ = require('lodash');

const { AirtablePTTBOutboundMainShopifyOrdersService } = require('./services/airtable');
const {
  ShopifyOrderService,
} = require('./services/shopify');

const shopifyOrderService = new ShopifyOrderService();
const airtablePTTBOutboundMainShopifyOrdersService = new AirtablePTTBOutboundMainShopifyOrdersService();

const consumer = async (event, context, callback) => {
  try {
    console.log({
      message: "Incoming request",
      data: event,
    });

    let results = [];
    for (const { messageId, body } of event.Records) {
      const jsonBody = JSON.parse(body);
      
      await shopifyOrderService.StoreOrderIntoBE(jsonBody);

      results.push(jsonBody);
    }

    let res = {
      statusCode: 200,
      body: JSON.stringify({
          message: `Successfully processed ${event.Records.length} messages.`,
          events: results,
      }),
      headers: {
        " X-Amz-Invocation-Type": "Event",
      }
    };

    console.log({
      message: "Outgoing response",
      data: res,
    });

    return res;

  } catch(err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "INTERNAL_SERVER_ERROR",
      })
    }
  } finally {

  }
};

const consumerHTTP = async(event) => {
  try {
    console.log({
      message: "Incoming request",
      data: event,
    });

    const body = JSON.parse(event.body);

    await shopifyOrderService.StoreOrderIntoBE(body);

    let res = {
      statusCode: 200,
      body: JSON.stringify(body),
    };

    console.log({
      message: "Outgoing response",
      data: res,
    });

    return res;
  } catch(err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "INTERNAL_SERVER_ERROR",
      })
    }
  }
}

const airtableReplicator = async(event) => {
  try {
    console.log({
      message: "Incoming request",
      data: event,
    });

    let results = [];
    for (const { messageId, body } of event.Records) {
      const jsonBody = JSON.parse(body);

      console.log(jsonBody);

      let res = await airtablePTTBOutboundMainShopifyOrdersService.UpsertBEShopifyOrder(jsonBody);

      results = results.concat(res);
    }

    let res = {
      statusCode: 200,
      body: JSON.stringify(results),
    };

    console.log({
      message: "Outgoing response",
      data: res,
    });

    return res;
  } catch(err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "INTERNAL_SERVER_ERROR",
      })
    }
  }
}

module.exports = {
  consumer,
  consumerHTTP,
  airtableReplicator,
};
