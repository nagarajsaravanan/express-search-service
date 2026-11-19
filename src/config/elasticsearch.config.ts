import { Client, type ClientOptions } from "@elastic/elasticsearch";
import { env } from "./env.config";
import { logger } from "./logger.config";

/**
 * Configure Elasticsearch Client Options
 */
const clientOptions: ClientOptions = {
  node: env.ELASTICSEARCH_NODE,
};

// Add Authentication if provided
if (env.ELASTICSEARCH_API_KEY) {
  clientOptions.auth = { apiKey: env.ELASTICSEARCH_API_KEY };
} else if (env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD) {
  clientOptions.auth = {
    username: env.ELASTICSEARCH_USERNAME,
    password: env.ELASTICSEARCH_PASSWORD,
  };
}

/**
 * Singleton Elasticsearch Client
 */
export const esClient = new Client(clientOptions);

/**
 * Ensures the target Product index exists with appropriate search mappings
 */
export const initProductIndex = async (): Promise<void> => {
  const index = env.ELASTICSEARCH_INDEX;
  try {
    const exists = await esClient.indices.exists({ index });
    if (!exists) {
      await esClient.indices.create({
        index,
        mappings: {
          properties: {
            name: {
              type: "text",
              fields: {
                keyword: { type: "keyword", ignore_above: 256 },
              },
            },
            description: { type: "text" },
            price: { type: "float" },
            images: { type: "keyword" },
            category: { type: "keyword" },
            brand: { type: "keyword" },
            sizes: { type: "keyword" },
            colors: { type: "keyword" },
            stock: { type: "integer" },
            material: { type: "keyword" },
            gender: { type: "keyword" },
            isActive: { type: "boolean" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
      });
      logger.info(`📦 [Elasticsearch] Index "${index}" created with search mappings.`);
    } else {
      logger.info(`📦 [Elasticsearch] Index "${index}" is ready.`);
    }
  } catch (error) {
    logger.error(`❌ [Elasticsearch] Failed to initialize index "${index}":`, { error });
  }
};

/**
 * Connect and verify Elasticsearch cluster health
 */
export const connectElasticsearch = async (): Promise<boolean> => {
  try {
    const info = await esClient.info();
    logger.info(
      `✅ [Elasticsearch] Connected to cluster "${info.cluster_name}" (v${info.version.number}) at ${env.ELASTICSEARCH_NODE}`
    );

    // Initialize index schema
    await initProductIndex();
    return true;
  } catch (error) {
    logger.warn(
      `⚠️ [Elasticsearch] Could not connect to Elasticsearch at ${env.ELASTICSEARCH_NODE}. Search features will be offline until Elasticsearch starts.`,
      { error: (error as Error).message }
    );
    return false;
  }
};

/**
 * Gracefully close Elasticsearch client connection
 */
export const disconnectElasticsearch = async (): Promise<void> => {
  try {
    await esClient.close();
    logger.info("🔌 [Elasticsearch] Client connection closed.");
  } catch (error) {
    logger.error("❌ [Elasticsearch] Error closing client connection:", { error });
  }
};

export default esClient;

