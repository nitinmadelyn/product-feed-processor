# Product Feed Processor

This program processes a product XML feed and sends product batches to an external service.

The program is designed to handle very large XML feeds efficiently while respecting the external service size constraint of 5MB per request.

# Features

• Streaming XML parsing (memory efficient)  
• Automatic batching up to 5MB payload size  
• Concurrent requests with controlled parallelism

# Installation

Install dependencies

    npm install

# Running the Program

    npm start

The program will:

1. Execute the file `src/assignment.js`
2. Stream the XML file `static/feed.xml`
3. Extract id, title, description for each product
4. Batch products into JSON arrays up to 5MB
5. Send batches to the external service

Optional Configuration:

The application can be configured using environment variables.

1. `CONCURRENCY`
   Controls how many batches are processed in parallel when sending data to the external service.

   Default: 3

   Example:
   `CONCURRENCY=5 npm start`

   This will allow up to 5 batches to be processed concurrently.

2. `MAX_BATCH_SIZE`
   Controls the maximum allowed batch size sent to the external service.

   Default: 5MB (5 _ 1024 _ 1024 bytes)

   Example:
   `MAX_BATCH_SIZE=7 npm start`

# Running the Tests

    npm test

# Architecture

Pipeline:

XML Stream → Product Extraction → Batch Builder → Async Queue → External Service

Each stage is isolated into its own module to keep responsibilities clear.

# Memory Efficiency

The XML file is processed using a streaming parser instead of loading the entire file into memory. This allows the program to process very large feeds (hundreds of MB or more).

# Batch Size Enforcement

The external service requires that each batch must not exceed 5MB.

To enforce this:

• Each product object is serialized  
• Its byte size is calculated using Buffer.byteLength  
• Products are added to the batch until the limit is reached

# Concurrency Control

External service calls are processed through a queue using limited concurrency.

This prevents:

• Overloading the external service
• Excessive memory usage
• Too many simultaneous network requests

The concurrency limit is currently set to 3 but you can configure using environment variable `CONCURRENCY`.

# Improvements for Production

Below are a few improvements that should be considered before deploying this solution to a production environment:

- Retry logic  
  Add retry logic with exponential backoff when the external service fails due to transient errors such as network issues or temporary service unavailability.

- Observability and monitoring  
  Introduce structured logging and metrics to track key indicators such as:
  - number of products processed
  - number of batches sent
  - external service latency
  - error rate

- Dead Letter Queue (DLQ)  
  If a batch fails even after multiple retries, move it to a dead letter queue so it can be inspected and reprocessed later.

- Backpressure handling  
  If the external service becomes slow or unavailable, temporarily slow down or pause ingestion to prevent the queue from growing indefinitely.

- Rate limiting  
  Implement rate limiting to ensure the external service is not overwhelmed or to comply with provider limits.

- Horizontal scalability  
  For very large feeds or high traffic scenarios, processing could be distributed across multiple workers or containers.

- Input validation  
  Validate product fields before batching to ensure malformed or incomplete data does not propagate to downstream systems.

- Alerting  
  Configure alerts for operational issues such as:
  - high failure rate when calling the external service
  - increasing queue backlog
  - unusually slow processing times