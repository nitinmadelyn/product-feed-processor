const pLimit = require("p-limit").default;
const externalService = require("../services/externalService.js");
const { getMaxBatchSize, getConcurrency } = require("../config/environment.js");

const service = externalService();
const MAX_BATCH_SIZE = getMaxBatchSize();
const CONCURRENCY = getConcurrency();
const limit = pLimit(CONCURRENCY);

const pendingTasks = [];

function enqueueBatch(batch) {
    const payload = JSON.stringify(batch);

    // Defensive check to ensure serialization did not exceed the allowed payload size
    if (Buffer.byteLength(payload, "utf8") > MAX_BATCH_SIZE) {
        throw new Error("Batch size exceeded after serialization");
    }
    const task = limit(async () => {
        try {
            await service.call(payload);
        } catch (err) {
            console.error("External service failed:", err.message);
        }
    });
    pendingTasks.push(task);

    return task;
}

async function waitForQueueDrain() {
    await Promise.all(pendingTasks);
}

module.exports = {
    enqueueBatch,
    waitForQueueDrain
};