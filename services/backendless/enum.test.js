const {
    ISOLATION_LEVEL,
    OPERATION_TYPE,
    TableSKUMatching,
    TableSKUOutboundISGOrders,
} = require('./enum');

describe('ISOLATION_LEVEL', () => {
    test('Should return correct enum', () => {
        const inputs = [
            {
                in: ISOLATION_LEVEL.ReadUncommited,
                out: "READ_UNCOMMITTED",
            },
        ];

        inputs.forEach(input => {
            expect(input.in).toBe(input.out);
        })
    })
})

describe('OPERATION_TYPE', () => {
    test('Should return correct enum', () => {
        const inputs = [
            {
                in: OPERATION_TYPE.CreateBulk,
                out: "CREATE_BULK",
            }, {
                in: OPERATION_TYPE.Delete,
                out: "DELETE",
            }, {
                in: OPERATION_TYPE.Find,
                out: "FIND",
            }, {
                in: OPERATION_TYPE.SetRelation,
                out: "SET_RELATION",
            }, {
                in: OPERATION_TYPE.UpdateBulk,
                out: "UPDATE_BULK",
            },
        ];

        inputs.forEach(input => {
            expect(input.in).toBe(input.out);
        })
    })
})

describe('TableSKUMatching', () => {
    test('Should able to init new class', () => {
        const table = new TableSKUMatching();

        expect(table.table_name).toBe("SKU_matching");
    })
})

describe('TableSKUOutboundISGOrders', () => {
    test('Should able to init new class', () => {
        const table = new TableSKUOutboundISGOrders();

        expect(table.table_name).toBe("SKU_Outbound_ISGOrders");
        expect(table.relationSKUMatching.table).toBe("SKU_matching");
        expect(table.relationSKUMatching.column).toBe("LINK_SKUMatching");
    })
})