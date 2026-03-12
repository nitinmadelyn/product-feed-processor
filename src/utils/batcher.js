const { getMaxBatchSize } = require("./getEnvironmentVar.js");
const MAX_BATCH_SIZE = getMaxBatchSize();

class BatchBuilder {
    constructor(onBatchReady) {
        this.batch = [];
        this.size = 2; // accounts for []
        this.onBatchReady = onBatchReady;
    }

    async addProduct(product) {
        const productString = JSON.stringify(product);
        const productSize = Buffer.byteLength(productString);

        // add 1 byte for comma if batch already has items
        const commaSize = this.batch.length > 0 ? 1 : 0;

        if (this.size + productSize + commaSize > MAX_BATCH_SIZE) {
            await this.flush();
        }

        this.batch.push(product);
        this.size += productSize + commaSize;
    }

    async flush() {
        if (this.batch.length === 0) return;

        const batchToSend = this.batch;

        this.batch = [];
        this.size = 2;

        await this.onBatchReady(batchToSend);
    }
}

module.exports = { BatchBuilder };