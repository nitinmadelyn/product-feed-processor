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

    const tag = currentTag.split(":").pop();
    if (tag === "id") currentProduct.id = value;
    if (tag === "title") currentProduct.title = value;
    if (tag === "description") currentProduct.description = value;
});

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
fs.createReadStream(xmlFilePath).pipe(parser);