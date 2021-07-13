'use strict';

const _ = require('lodash');

const {
    SKUOutboundISGOrdersService,
} = require('../backendless');

const {
    TOPIC,
} = require('./enum');

const sKUOutboundISGOrdersService = new SKUOutboundISGOrdersService();

class ShopifyOrderService {
    async StoreOrderIntoBE(data) {
        try {
            for(let item of _.get(data, "line_items")) {
                const records = await sKUOutboundISGOrdersService.GetByQuery({
                    Store_Name: _.get(data, "shop_name"),
                    ShopifyID:_.get(data, "id"),
                    LineItemName: _.get(item, "name"),
                })

                if(records.length == 0) {
                    console.log({
                        action: "INSERT BE",
                        data: item,
                    });

                    await sKUOutboundISGOrdersService.InsertRecord(data, item);

                    continue;
                } else {
                    console.log({
                        action: "UPDATE BE",
                        data: item,
                    });

                    await sKUOutboundISGOrdersService.UpdateModifiedRecord(data, item);

                    continue;
                }
            }

            return

        } catch(err) {
            throw err;
        }
    };
}

module.exports = {
    ShopifyOrderService,
}