function getMaxBatchSize() {
    const DEFAULT_SIZE = 5242880; // 5MB

    if (!process.env.MAX_BATCH_SIZE) {
        return DEFAULT_SIZE;
    }

    const envSize = parseInt(process.env.MAX_BATCH_SIZE, 10);

    if (!isNaN(envSize) && envSize > 0) {
        const sizeInBytes = envSize * 1024 * 1024;
        console.log(`Using custom MAX_BATCH_SIZE: ${envSize} MB (${sizeInBytes} bytes)`);
        return sizeInBytes;
    }

    console.warn(
        `Invalid MAX_BATCH_SIZE value: ${process.env.MAX_BATCH_SIZE}. Falling back to default ${DEFAULT_SIZE} bytes.`
    );

    return DEFAULT_SIZE;
}

function getConcurrency() {
    const DEFAULT_CONCURRENCY = 3;

    if (!process.env.CONCURRENCY) {
        return DEFAULT_CONCURRENCY;
    }

    const envConcurrency = parseInt(process.env.CONCURRENCY, 10);

    if (!isNaN(envConcurrency) && envConcurrency > 0) {
        console.log(`Using custom CONCURRENCY: ${envConcurrency}`);
        return envConcurrency;
    }

    console.warn(
        `Invalid CONCURRENCY value: ${process.env.CONCURRENCY}. Falling back to default ${DEFAULT_CONCURRENCY}.`
    );

    return DEFAULT_CONCURRENCY;
}

module.exports = {
    getMaxBatchSize,
    getConcurrency
};