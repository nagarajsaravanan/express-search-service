import app from "./app";
import { env } from "./config/env.config";
import {
  connectElasticsearch,
  disconnectElasticsearch,
} from "./config/elasticsearch.config";

const startServer = async () => {
  try {
    // Connect to Elasticsearch
    await connectElasticsearch();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 [Search Service] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`🔗 Health Check: http://localhost:${env.PORT}/health`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      await disconnectElasticsearch();
      server.close(() => {
        console.log("💤 HTTP server closed.");
        process.exit(0);
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        console.error("⚠️ Forcefully shutting down after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start Search Service server:", error);
    process.exit(1);
  }
};

startServer();

