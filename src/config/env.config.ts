import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5001,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE || "http://127.0.0.1:9200",
  ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME || "",
  ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD || "",
  ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY || "",
  ELASTICSEARCH_INDEX: process.env.ELASTICSEARCH_INDEX || "products",
};

export default env;
