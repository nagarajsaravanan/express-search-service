import { createClient, type RedisClientType } from "redis";
import { env } from "./env.config";
import { logger } from "./logger.config";

/**
 * Singleton Redis Client
 */
export const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL,
});

// Lifecycle Event Listeners
redisClient.on("connect", () => {
  logger.info(`🔄 [Redis] Connecting to server at ${env.REDIS_URL}...`);
});

redisClient.on("ready", () => {
  logger.info(`✅ [Redis] Connected and ready for commands/streams.`);
});

redisClient.on("error", (err) => {
  logger.error("❌ [Redis] Client error:", { error: err.message });
});

redisClient.on("reconnecting", () => {
  logger.warn("⚠️ [Redis] Reconnecting to server...");
});

redisClient.on("end", () => {
  logger.info("🔌 [Redis] Connection closed.");
});

/**
 * Connect to Redis instance safely
 */
export const connectRedis = async (): Promise<boolean> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    logger.warn(
      `⚠️ [Redis] Could not connect to Redis at ${env.REDIS_URL}. Redis caching and stream consumers will be offline until Redis starts.`,
      { error: (error as Error).message }
    );
    return false;
  }
};

/**
 * Gracefully disconnect from Redis instance
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info("🔌 [Redis] Client disconnected gracefully.");
    }
  } catch (error) {
    logger.error("❌ [Redis] Error disconnecting client:", { error });
  }
};

export default redisClient;

