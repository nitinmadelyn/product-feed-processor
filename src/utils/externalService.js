const ONE_MEGA_BYTE = 1_048_576.0;

function prettyPrint(batch, batchNum) {
    const products = JSON.parse(batch);
    const batchSize = Buffer.byteLength(batch, 'utf8');
    const size = batchSize / ONE_MEGA_BYTE;

    console.log(`\x1b[1mReceived batch${String(batchNum).padStart(4)}\x1b[22m`);
    console.log(`Size: ${size.toFixed(4).padStart(10)}MB`);
    console.log(`Products: ${String(products.length).padStart(8)}`);
    console.log('\n');
}

function externalService() {
    let batchNum = 0;

    return {
        call(batch) {
            batchNum += 1;
            prettyPrint(batch, batchNum);
        },
    };
}

module.exports = externalService;