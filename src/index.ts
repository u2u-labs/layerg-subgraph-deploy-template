import express from "express";
import { redis } from "./redisClient";

const initialize = async () => {
  const app = express();


  await redis.connect();
  console.log("Redis connected");

  await redis.subscribe("", (message: string) => {

  })
};


// Define your routes and middleware here
