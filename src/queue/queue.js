const pLimit = require("p-limit").default;
const externalService = require("../services/externalService.js");
const { getMaxBatchSize, getConcurrency } = require("../config/environment.js");

const service = externalService();
const MAX_BATCH_SIZE = getMaxBatchSize();
const CONCURRENCY = getConcurrency();
const limit = pLimit(CONCURRENCY);

const tasks = [];

function enqueueBatch(batch) {
    const payload = JSON.stringify(batch);

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
    tasks.push(task);

    return task;
}

async function waitForQueueDrain() {
    await Promise.all(tasks);
}

module.exports = {
    enqueueBatch,
    waitForQueueDrain
};