'use strict';

const AIRTABLE = {
    API_KEY: process.env.AIRTABLE_API_KEY || "",
    PTTBOutbound: {
        ID: "appMo5wIJrlBB1ahq",
        TABLE: {
            MainShopifyOrders: "Main Shopify Orders (PTTB)",
        }
    }
};

module.exports = {
    AIRTABLE,
}
