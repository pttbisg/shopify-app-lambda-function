'use strict';

const { default: axios } = require('axios');
const dotenv = require("dotenv");
const _ = require('lodash');

const {
    ISOLATION_LEVEL,
    OPERATION_TYPE,
    TableSKUMatching,
    TableSKUOutboundISGOrders,
} = require('./enum');

dotenv.config();


class SKUOutboundISGOrdersService {
    constructor() {
        this.tableSKUOutboundISGOrders = new TableSKUOutboundISGOrders();
        this.tableSKUMatching = new TableSKUMatching();
        this.skuMatchingService = new SKUMatchingService();
    }

    async InsertRecord(data, item) {
        const operations = this.createInsertRecordTransactionPayload(data, item);

        console.log(await postBETransaction(operations));

        return
    };

    createInsertRecordTransactionPayload(data, item) {
        return {
            "isolationLevelEnum": ISOLATION_LEVEL.ReadUncommited,
            "operations": [
                {
                    "operationType": OPERATION_TYPE.CreateBulk,
                    "table": this.tableSKUOutboundISGOrders.table_name,
                    "opResultId": `${this.tableSKUOutboundISGOrders.table_name}-create`,
                    "payload": [{
                        "ShopifyID": _.get(data, "id"),
                        "Status": _.get(data, "topic"),
                        "Notes": _.get(data, "note"),
                        "ShippingName": _.get(data, "shipping_address.name"),
                        "OrderCreateAt": _.get(data, "created_at"),
                        "Email": _.get(data, "email"),
                        "FinancialStatus": _.get(data, "financial_status"), // N - string
                        "FulfillmentStatus": _.get(data, "fulfillment_status"), // N - string
                        "BuyerAcceptsMarketing": _.get(data, "buyer_accepts_marketing"), // N - boolean
                        "Currency": _.get(data, "currency"), // N - string
                        "SubtotalPrice": parseFloat(_.get(data, "subtotal_price")), // N - float
                        "TotalTax": parseFloat(_.get(data, "total_tax")), // N - float
                        "TotalPrice": parseFloat(_.get(data, "total_price")), // N - float
                        "DiscountCode": _.get(data, "discount_codes[0].code"), // N - string
                        "DiscountAmount": parseFloat(_.get(data, "discount_codes[0].amount")), // N - float
                        "ShippingMethod": _.get(data, "shipping_lines[0].title"), // N - string
                        "LineitemQty": parseFloat(_.get(item, "quantity")),
                        "LineItemName": _.get(item, "name"), // N - string
                        "LineitemPrice": parseFloat(_.get(item, "price")),
                        "LineitemSKU": _.get(item, "sku"),
                        "LineItemRequiresShipping": _.get(item, "requires_shipping"), // N - boolean
                        "LineItemTaxable": _.get(item, "taxable"), // N - boolean
                        "LineItemFulfillmentStatus": _.get(item, "fulfillment_status"), // N - string
                        "LineItemVendor": _.get(item, "vendor"), // N - string
                        "LineitemDiscount": parseFloat(_.get(item, "total_discount")),
                        "BillingName": _.get(data, "billing_address.name"), // N - string
                        "BillingAddress1": _.get(data, "billing_address.address1"), // N - string
                        "BillingAddress2": _.get(data, "billing_address.address2"), // N - string
                        "BillingCompany": _.get(data, "billing_address.company"), // N - string
                        "BillingCity": _.get(data, "billing_address.city"), // N - string
                        "BillingZip": _.get(data, "billing_address.zip"), // N - string
                        "BillingProvince": _.get(data, "billing_address.province"), // N - string
                        "BillingCountry": _.get(data, "billing_address.country"), // N - string
                        "BillingPhone": _.get(data, "billing_address.phone"), // N - string
                        "ShippingAddress1": _.get(data, "shipping_address.address1"), // N - string
                        "ShippingAddress2": _.get(data, "shipping_address.address2"), // N - string
                        "ShippingCompany": _.get(data, "shipping_address.company"), // N - string
                        "ShippingCity": _.get(data, "shipping_address.city"), // N - string
                        "ShippingZip": _.get(data, "shipping_address.zip"), // N - string
                        "ShippingProvince": _.get(data, "shipping_address.province"), // N - string
                        "ShippingCountry": _.get(data, "shipping_address.country"), // N - string
                        "ShippingPhone": _.get(data, "shipping_address.phone"), // N - string
                        "NoteAttributes": {
                            "value": _.get(data, "note_attributes", []),
                        }, // N - json
                        "CancelledAt": _.get(data, "cancelled_at"), // N - string
                        "Tags": _.get(data, "tags"), // N - string
                        "SourceName": _.get(data, "source_name"), // N - string
                        "Phone": _.get(data, "phone"), // N - string
                        "IntOrderNum": parseFloat(_.get(data, "order_number")),
                        "MobileNumber": _.get(data, "billing_address.phone"),
                        "OrderNum": _.get(data, "name"),
                        "PostalCode": _.get(data, "billing_address.zip"),
                        "Store_Name": _.get(data, "shop_name"),
                        "Name": _.get(data, "name"), // N - string
                        "ReferringSite": _.get(data, "referring_site"), // N - string
                        "BarcodeStandaloneCol": this.skuMatchingService.GetBarcodeByLocalSKU(_.get(item, "sku")),
                    }]
                }, {
                    "operationType": OPERATION_TYPE.Find,
                    "table": this.tableSKUMatching.table_name,
                    "opResultId": `${this.tableSKUMatching.table_name}-find`,
                    "payload": {
                        "pageSize": 1,
                        "whereClause": `${this.tableSKUMatching.relationLocalSKU.column}.localSKU = '${_.get(item, "sku")}' AND ${this.tableSKUMatching.relationLocalSKU.column}.Store_Name = '${_.get(data, "shop_name")}'`
                    }
                }, {
                    "operationType": OPERATION_TYPE.SetRelation,
                    "table": this.tableSKUOutboundISGOrders.table_name,
                    "payload": {
                        "parentObject": {
                            "___ref": true,
                            "opResultId": `${this.tableSKUOutboundISGOrders.table_name}-create`,
                            "resultIndex" : 0
                        },
                        "relationColumn": this.tableSKUOutboundISGOrders.relationSKUMatching.column,
                        "unconditional": {
                            "___ref": true,
                            "opResultId" : `${this.tableSKUMatching.table_name}-find`,
                        }
                    }
                }
            ]
        }
    }

    async UpdateModifiedRecord(data, item) {
        const operations = this.createUpdateModifiedRecordTransactionPayload(data, item);

        console.log(await postBETransaction(operations));

        return
    };

    createUpdateModifiedRecordTransactionPayload(data, item) {
        return {
            "isolationLevelEnum": ISOLATION_LEVEL.ReadUncommited,
            "operations": [
                {
                    "operationType": OPERATION_TYPE.Find,
                    "table": this.tableSKUOutboundISGOrders.table_name,
                    "opResultId": `${this.tableSKUOutboundISGOrders.table_name}-find`,
                    "payload": {
                        "pageSize": 1,
                        "whereClause": `Store_Name = '${_.get(data, "shop_name")}' AND ShopifyID = '${_.get(data, "id")}'`
                    }
                }, {
                    "operationType": OPERATION_TYPE.Find,
                    "table": this.tableSKUMatching.table_name,
                    "opResultId": `${this.tableSKUMatching.table_name}-find`,
                    "payload": {
                        "pageSize": 1,
                        "whereClause": `${this.tableSKUMatching.relationLocalSKU.column}.localSKU = '${_.get(item, "sku")}' AND ${this.tableSKUMatching.relationLocalSKU.column}.Store_Name = '${_.get(data, "shop_name")}'`
                    }
                }, 
                {
                    "operationType": OPERATION_TYPE.UpdateBulk,
                    "table": this.tableSKUOutboundISGOrders.table_name,
                    "opResultId": `${this.tableSKUOutboundISGOrders.table_name}-update_bulk`,
                    "payload": {
                        "unconditional" : {
                            "___ref":true,
                            "opResultId": `${this.tableSKUOutboundISGOrders.table_name}-find`,
                        }, 
                        "changes": {
                            // "ShopifyID": _.get(data, "id"),
                            "Status": _.get(data, "topic"),
                            "Notes": _.get(data, "note"),
                            "ShippingName": _.get(data, "shipping_address.name"),
                            "OrderCreateAt": _.get(data, "created_at"),
                            "Email": _.get(data, "email"),
                            "FinancialStatus": _.get(data, "financial_status"), // N - string
                            "FulfillmentStatus": _.get(data, "fulfillment_status"), // N - string
                            "BuyerAcceptsMarketing": _.get(data, "buyer_accepts_marketing"), // N - boolean
                            "Currency": _.get(data, "currency"), // N - string
                            "SubtotalPrice": parseFloat(_.get(data, "subtotal_price")), // N - float
                            "TotalTax": parseFloat(_.get(data, "total_tax", 0)), // N - float
                            "TotalPrice": parseFloat(_.get(data, "total_price")), // N - float
                            "DiscountCode": _.get(data, "discount_codes[0].code"), // N - string
                            "DiscountAmount": parseFloat(_.get(data, "discount_codes[0].amount")), // N - float
                            "ShippingMethod": _.get(data, "shipping_lines[0].title"), // N - string
                            "LineitemQty": parseFloat(_.get(item, "quantity")),
                            "LineItemName": _.get(item, "name"), // N - string
                            "LineitemPrice": parseFloat(_.get(item, "price")),
                            "LineitemSKU": _.get(item, "sku"),
                            "LineItemRequiresShipping": _.get(item, "requires_shipping"), // N - boolean
                            "LineItemTaxable": _.get(item, "taxable"), // N - boolean
                            "LineItemFulfillmentStatus": _.get(item, "fulfillment_status"), // N - string
                            "LineItemVendor": _.get(item, "vendor"), // N - string
                            "LineitemDiscount": parseFloat(_.get(item, "total_discount")),
                            "BillingName": _.get(data, "billing_address.name"), // N - string
                            "BillingAddress1": _.get(data, "billing_address.address1"), // N - string
                            "BillingAddress2": _.get(data, "billing_address.address2"), // N - string
                            "BillingCompany": _.get(data, "billing_address.company"), // N - string
                            "BillingCity": _.get(data, "billing_address.city"), // N - string
                            "BillingZip": _.get(data, "billing_address.zip"), // N - string
                            "BillingProvince": _.get(data, "billing_address.province"), // N - string
                            "BillingCountry": _.get(data, "billing_address.country"), // N - string
                            "BillingPhone": _.get(data, "billing_address.phone"), // N - string
                            "ShippingAddress1": _.get(data, "shipping_address.address1"), // N - string
                            "ShippingAddress2": _.get(data, "shipping_address.address2"), // N - string
                            "ShippingCompany": _.get(data, "shipping_address.company"), // N - string
                            "ShippingCity": _.get(data, "shipping_address.city"), // N - string
                            "ShippingZip": _.get(data, "shipping_address.zip"), // N - string
                            "ShippingProvince": _.get(data, "shipping_address.province"), // N - string
                            "ShippingCountry": _.get(data, "shipping_address.country"), // N - string
                            "ShippingPhone": _.get(data, "shipping_address.phone"), // N - string
                            "NoteAttributes": {
                                "value": _.get(data, "note_attributes", "[]"),
                            }, // N - json
                            "CancelledAt": _.get(data, "cancelled_at"), // N - string
                            "Tags": _.get(data, "tags"), // N - string
                            "SourceName": _.get(data, "source_name"), // N - string
                            "Phone": _.get(data, "phone"), // N - string
                            "IntOrderNum": parseFloat(_.get(data, "order_number")),
                            "MobileNumber": _.get(data, "billing_address.phone"),
                            "OrderNum": _.get(data, "name"),
                            "PostalCode": _.get(data, "billing_address.zip"),
                            // "Store_Name": _.get(data, "shop_name"),
                            "Name": _.get(data, "name"), // N - string
                            "ReferringSite": _.get(data, "referring_site"), // N - string
                            "BarcodeStandaloneCol": this.skuMatchingService.GetBarcodeByLocalSKU(_.get(item, "sku")),
                        }
                    },
                }, {
                    "operationType": OPERATION_TYPE.SetRelation,
                    "table": this.tableSKUOutboundISGOrders.table_name,
                    "payload": {
                        "parentObject": {
                            "___ref": true,
                            "opResultId": `${this.tableSKUOutboundISGOrders.table_name}-find`,
                            "resultIndex" : 0,
                            "propName" : "objectId",
                        },
                        "relationColumn": this.tableSKUOutboundISGOrders.relationSKUMatching.column,
                        "unconditional": {
                            "___ref": true,
                            "opResultId": `${this.tableSKUMatching.table_name}-find`,
                        }
                    }
                }
            ]
        }
    }

    async GetByQuery({ Store_Name, ShopifyID, LineItemName}) {
        try {
            const payload = {
                method: "GET",
                url: `https://api.backendless.com/${process.env.BACKENDLESS_APP_ID_PROD}/${process.env.BACKENDLESS_APP_KEY_PROD}/data/${this.tableSKUOutboundISGOrders.table_name}?where=ShopifyID='${ShopifyID}' and Store_Name='${Store_Name}' and LineItemName='${LineItemName}'`,
                headers: {
                    "Content-Type": "application/json"
                },
            };
    
            const res = await axios(payload);
            
            return res.data;
        } catch(err) {
            throw err;
        }
    }

    async GetShopifyOrderInfoByQuery({ Store_Name, ShopifyID}) {
        try {
            const payload = {
                method: "GET",
                url: `https://api.backendless.com/${process.env.BACKENDLESS_APP_ID_PROD}/${process.env.BACKENDLESS_APP_KEY_PROD}/data/${this.tableSKUOutboundISGOrders.table_name}?where=ShopifyID='${ShopifyID}' and Store_Name='${Store_Name}'`,
                headers: {
                    "Content-Type": "application/json"
                },
            };
    
            const res = await axios(payload);
            
            return res.data;
        } catch(err) {
            throw err;
        }
    }

    async UpdateAirtableIDByQuery({Store_Name, ShopifyID, LineItemName, AirtableID}) {
        try {
            const payload = {
                method: "PUT",
                url: `https://api.backendless.com/${process.env.BACKENDLESS_APP_ID_PROD}/${process.env.BACKENDLESS_APP_KEY_PROD}/data/bulk/${this.tableSKUOutboundISGOrders.table_name}?where=ShopifyID='${ShopifyID}' and Store_Name='${Store_Name}' and LineItemName='${LineItemName}'`,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    AirtableRecordID: AirtableID,
                },
            };
    
            const res = await axios(payload);
            
            return res.data;
        } catch(err) {
            throw err;
        }
    }
}

class SKUMatchingService {
    constructor() {
        this.tableSKUMatching = new TableSKUMatching();
    }

    async GetBarcodeByLocalSKU(localSKU) {try {
        const payload = {
            method: "GET",
            url: `https://api.backendless.com/${process.env.BACKENDLESS_APP_ID_PROD}/${process.env.BACKENDLESS_APP_KEY_PROD}/data/${this.tableSKUMatching.table_name}?props=Barcode&where=${this.tableSKUMatching.relationLocalSKU.column}.localSKU='${localSKU}'`,
            headers: {
                "Content-Type": "application/json"
            },
        };

        const res = await axios(payload);
        
        return res.data;
    } catch(err) {
        throw err;
    }

    }
}

async function postBETransaction(data) {
    try {
        const payload = {
            method: "POST",
            url: `https://api.backendless.com/${process.env.BACKENDLESS_APP_ID_PROD}/${process.env.BACKENDLESS_APP_KEY_PROD}/transaction/unit-of-work`,
            data: data,
            headers: {
                "Content-Type": "application/json"
            },
        };

        const res = await axios(payload);
        
        return res.data;
    } catch(err) {
        throw err;
    }
}


module.exports = {
    SKUOutboundISGOrdersService,
    SKUMatchingService,
}