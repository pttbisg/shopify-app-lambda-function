'use strict';

const ISOLATION_LEVEL = {
    ReadUncommited: "READ_UNCOMMITTED",
};

const OPERATION_TYPE = {
    CreateBulk: "CREATE_BULK",
    Find: "FIND",
    SetRelation: "SET_RELATION",
    UpdateBulk: "UPDATE_BULK",
    Delete: "DELETE",
};

class TableSKUOutboundISGOrders {
    constructor() {
        this.table_name = "SKU_Outbound_ISGOrders";
        this.relationSKUMatching = {
            table: "SKU_matching",
            column: "LINK_SKUMatching",
        }
    }
}

class TableSKUMatching {
    constructor() {
        this.table_name = "SKU_matching";
        this.relationLocalSKU = {
            table: "SKU_localSKU",
            column: "LINK_localSKU",
        }
    }
}

module.exports = {
    ISOLATION_LEVEL,
    OPERATION_TYPE,
    TableSKUMatching,
    TableSKUOutboundISGOrders,
}
