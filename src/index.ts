import express from "express";
import { redis } from "./redisClient";
import { EventName } from "./handlers/handlers";
import config from "dotenv";

config.config();

async function main() {
  const app = express();
  const port = process.env.PORT;

  if (!port) {
    throw new Error("PORT is not defined");
  }

  await redis.connect();

  const handlers: Record<string, (data: any) => Promise<any>> = {
    NewPost: async (data) => {
      console.log("NewPost", data);
    },
  };

  redis.subscribe("$subgraphId", (message: string) => {
    const data = JSON.parse(message) as { eventName: string; data: string };
    if (!handlers[data.eventName]) return;
    handlers[data.eventName](data.data);
  });

  handlers["NewPost"]({
    id: "1",
    title: "Hello World",
    content: "This is my first post",
    author: "1",
    createdAt: new Date().toISOString(),
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

main().catch(console.error);
