import "dotenv/config";

import { app } from "./app.js";
import connectDB from "./db/index.js";

const port = Number(process.env.PORT) || 5000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    });
