const { BatchBuilder } = require("../batch/batcher");

describe("BatchBuilder", () => {

    test("adds product to batch", async () => {
        const mockCallback = jest.fn();

        const batcher = new BatchBuilder(mockCallback);

        await batcher.addProduct({
            id: "1",
            title: "A",
            description: "test"
        });

        expect(batcher.batch.length).toBe(1);
    });

    test("flushes batch when size exceeds limit", async () => {
        const mockCallback = jest.fn();

        const batcher = new BatchBuilder(mockCallback);

        const largeProduct = {
            id: "1",
            title: "A",
            description: "x".repeat(3 * 1024 * 1024)
        };

        await batcher.addProduct(largeProduct);
        await batcher.addProduct(largeProduct);

        expect(mockCallback).toHaveBeenCalled();
    });

    test("flush resets batch", async () => {
        const mockCallback = jest.fn();

        const batcher = new BatchBuilder(mockCallback);

        await batcher.addProduct({
            id: "1",
            title: "A",
            description: "test"
        });

        await batcher.flush();

        expect(batcher.batch.length).toBe(0);
    });

});