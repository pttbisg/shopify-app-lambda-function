'use strict';
require('dotenv').config();
const _ = require('lodash');
const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

const {SKUMatchingService} = require("../backendless");

class AirtablePTTBOutboundMainShopifyOrdersService {
    constructor() {
        this.skuMatchingService = new SKUMatchingService();
        this.baseID = process.env.AIRTABLE_BASE_ID;
        this.tableName = process.env.SHOPIFY_MAIN_TABLE;
    }

    /**
     *
     * @param unfilteredObject
     * @returns {{}|null}
     * @private
     */
    _filterObject(unfilteredObject) {
        if (!unfilteredObject) return null;
        const filteredObject = {};
        Object.entries(unfilteredObject).filter((entry) => {
            if (entry[1]) {
                filteredObject[`${entry[0]}`] = entry[1]
            }
        });
        return filteredObject;
    }

    /**
     *
     * @param data
     * @param item
     * @param id
     * @returns {{}}
     * @private
     */
    _convertShopifyToAirtableObject(data, item, id = '') {
        const result = {};

        const orderDetails = {
            "Name": _.get(item, "name"),
            "STATUS": _.get(data, "topic"),
            "Notes": _.get(data, "note", ""),
            "Created at": _.get(data, "created_at"),
            "Email": _.get(data, "email", ""),
            "Financial Status": _.get(data, "financial_status", ""),
            "Fulfillment Status": _.get(data, "fulfillment_status", ""),
            "Accepts Marketing": _.get(data, "buyer_accepts_marketing", "").toString(),
            "Currency": _.get(data, "currency", ""),
            "Subtotal": _.get(data, "subtotal_price", ""),
            "Taxes": _.get(data, "total_tax", ""),
            "Total": _.get(data, "total_price", ""),
            "Note Attributes": _.get(data, "note_attributes", "[]").toString(),
            "Cancelled at": _.get(data, "cancelled_at", ""),
            "Id": _.get(data, "id", "").toString(),
            "Tags": _.get(data, "tags", ""),
            "Phone": _.get(data, "phone", ""),
            "Discount Code": _.get(data, "discount_codes[0].code", ""),
            "Discount Amount": _.get(data, "discount_codes[0].amount", ""),
        };

        const lineItemDetails = {
            "Lineitem quantity": _.get(item, "quantity", 0),
            "Lineitem name": _.get(item, "name", "").toString(),
            "Lineitem price": _.get(item, "price", "").toString(),
            //"Lineitem sku": _.get(item, "sku", "").toString(),
            "Lineitem requires shipping": _.get(item, "requires_shipping", "").toString(),
            "Lineitem taxable": _.get(item, "taxable", "").toString(),
            "Lineitem discount": _.get(item, "total_discount", ""),
        };

        const billingDetails = {
            "Billing Name": _.get(data, "billing_address.name", ""),
            "Billing Street": _.get(data, "billing_address.address1", ""),
            "Billing Address1": _.get(data, "billing_address.address1", ""),
            "Billing Address2": _.get(data, "billing_address.address2", ""),
            "Billing Company": _.get(data, "billing_address.company", ""),
            "Billing City": _.get(data, "billing_address.city", ""),
            "Billing Zip": _.get(data, "billing_address.zip", ""),
            "Billing Province": _.get(data, "billing_address.province", ""),
            "Billing Country": _.get(data, "billing_address.country", ""),
            "Billing Phone": _.get(data, "billing_address.phone", "")
        }

        /**
         * shippingObject
         * @property {String} first_name
         * @property {String} last_name
         * @type {{}}
         */
        const shippingObject = _.get(data, "shipping_address", {})
        const shippingDetails = {
            "Shipping Name": shippingObject ? `${shippingObject.first_name} ${shippingObject.last_name}` : '',
            "Shipping Street": _.get(data, "shipping_address.address1", ""),
            "Shipping Address1": _.get(data, "shipping_address.address1", ""),
            "Shipping Address2": _.get(data, "shipping_address.address2", ""),
            "Shipping Company": _.get(data, "shipping_address.company", ""),
            "Shipping City": _.get(data, "shipping_address.city", ""),
            "Shipping Zip": _.get(data, "shipping_address.zip", ""),
            "Shipping Province": _.get(data, "shipping_address.province", ""),
            "Shipping Country": _.get(data, "shipping_address.country", ""),
            "Shipping Phone": _.get(data, "shipping_address.phone", ""),
            "Shipping Method": _.get(data, "shipping_lines[0].title", ""),
        }

        const vendorDetails = {
            "Vendor": _.get(item, "vendor", ""),
            "Source": _.get(data, "source_name", ""),
            "Internal Order Number": _.get(data, "order_number", 0),
            "Store_Name": _.get(data, "shop_name", ""),
            "Referring Site": _.get(data, "referring_site", "")
        }

        result["fields"] = this._filterObject({
            ...orderDetails,
            ...lineItemDetails,
            ...billingDetails,
            ...shippingDetails,
            ...vendorDetails,
        });
        console.log("Result", result["fields"]);
        return result;
    }

    /**
     *
     * @param Store_Name
     * @param ShopifyID
     * @param Name
     * @returns {Promise<null>}
     * @private
     */
    async _getShopifyOrderId({Store_Name, ShopifyID, Name}) {
        let shopifyRecordId = null;
        await base("Main Shopify Orders (PTTB)").select({
            maxRecords: 1,
            filterByFormula: `AND({Store_Name}="${Store_Name}",{Id}=${ShopifyID},{Lineitem name}="${Name}")`
        }).eachPage((records, processNextPage) => {
            if (records.length === 1) {
                shopifyRecordId = records[0]['id']
            }
            processNextPage();
        });
        return shopifyRecordId;
    }

    /**
     *
     * @param data
     * @param item
     * @returns {Promise<any>}
     * @private
     */
    async _insertIntoAirTable(data, item) {
        const shopifyObject = this._convertShopifyToAirtableObject(data, item);
        console.log("Inserting Into AirTable", shopifyObject);
        const records = await base(this.tableName).create([{...shopifyObject}]);
        return records[0]['id'];
    }

    /**
     *
     * @param data
     * @param item
     * @param airtableId
     * @returns {Promise<*>}
     * @private
     */
    async _updateAirTableOrderById(data, item, airtableId) {
        const shopifyObject = this._convertShopifyToAirtableObject(data, item);
        console.log(`Updating AirTable ${airtableId}`, shopifyObject);

        const updatedRecord = base(this.tableName).update([
            {
                id: airtableId,
                ...shopifyObject
            }
        ]);
        return updatedRecord;
    }

    /**
     *
     * @param data
     * @param {String} data.topic
     * @returns {Promise<*[]>}
     * @constructor
     */
    async UpsertBEShopifyOrder(data) {
        const totalRecords = [];
        try {
            for (let item of _.get(data, "line_items")) {
                switch (data.topic) {
                    case "ORDERS_CREATE": {
                        const insertedRecord = await this._insertIntoAirTable(data, item);
                        totalRecords.push(insertedRecord);
                        break;
                    }
                    case "ORDERS_UPDATED": {
                        const existingOrderId = await this._getShopifyOrderId({
                            Store_Name: _.get(data, "shop_name"),
                            ShopifyID: _.get(data, "id"),
                            Name: item.name
                        });

                        if(existingOrderId) {
                            const updatedRecord = await this._updateAirTableOrderById(data, item, existingOrderId);
                            totalRecords.push(updatedRecord);
                        }
                        break;
                    }
                    default: {
                        console.log("Unsupported Method", data.topic);
                        break;
                    }
                }

            }

            console.log(totalRecords);

        } catch (e) {
            console.log(e);
        }
        return totalRecords;
    }
}

module.exports = {
    AirtablePTTBOutboundMainShopifyOrdersService,
}
