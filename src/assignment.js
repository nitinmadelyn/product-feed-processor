/**
 * Product feed processor
 *
 * Pipeline:
 * XML stream → SAX parser → Product extraction → Batch builder → Queue → External service
 *
 * The feed is processed in a streaming manner to avoid loading the entire file into memory.
 * Products are grouped into batches with a configurable max payload size & concurrency and sent to
 * the external service with limited concurrency.
 */

const fs = require("fs");
const sax = require("sax");
const path = require("path");
const { BatchBuilder } = require("./batch/batcher");
const { enqueueBatch, waitForQueueDrain } = require("./queue/queue");

const parser = sax.createStream(true);

let currentProduct = null;
let currentTag = null;

const batchBuilder = new BatchBuilder(async (batch) => {
    await enqueueBatch(batch);
});

parser.on("opentag", (node) => {
    if (node.name === "item") {
        currentProduct = {};
    }
    currentTag = node.name;
});

parser.on("text", (text) => {
    if (!currentProduct) return;

    const value = text.trim();
    if (!value) return;

    // Remove XML namespace prefix (e.g., g:id → id)
    const tag = currentTag.split(":").pop();
    switch (tag) {
        case "id":
            currentProduct.id = value;
            break;
        case "title":
            currentProduct.title = value;
            break;
        case "description":
            currentProduct.description = value;
            break;
    }
});

// Extract required fields from <item> tags and send them to the batch builder
parser.on("closetag", async (tag) => {
    if (tag === "item" && currentProduct) {
        await batchBuilder.addProduct({
            id: currentProduct.id,
            title: currentProduct.title,
            description: currentProduct.description
        });
        currentProduct = null;
    }
});

parser.on("error", (err) => {
    console.error("XML parsing error:", err.message);
    process.exit(1);
});

parser.on("end", async () => {
    await batchBuilder.flush();
    await waitForQueueDrain();
});

const xmlFilePath = path.join(__dirname, "static", "feed.xml");
if (!fs.existsSync(xmlFilePath)) {
    console.error("Feed file not found:", xmlFilePath);
    process.exit(1);
}
fs.createReadStream(xmlFilePath).pipe(parser);