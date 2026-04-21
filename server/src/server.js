import "dotenv/config";
import http from "node:http";

import { app } from "./app.js";
import connectDB from "./db/index.js";
import { initializeSocketServer } from "./socket/index.js";

const port = Number(process.env.PORT) || 5000;
const httpServer = http.createServer(app);

connectDB()
  .then(() => {
    initializeSocketServer(httpServer);

    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });
