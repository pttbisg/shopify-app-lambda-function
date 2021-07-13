const {
    TOPIC,
} = require('./enum');

describe('topic', () => {
    test('Should return correct enum', () => {
        const inputs = [
            {
                in: TOPIC.OrdersCreate,
                out: "ORDERS_CREATE",
            }, {
                in: TOPIC.OrdersUpdated,
                out: "ORDERS_UPDATED",
            },
        ];

        inputs.forEach(input => {
            expect(input.in).toBe(input.out);
        })
    })
})