import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "node:url";

import {
    getAuthConnection,
    getHostelConnection,
} from "../db/index.js";
import { seedAdmins } from "./seedAdmins.js";
import { seedStudents } from "./seedStudents.js";

const closeConnections = async () => {
    const connections = [getAuthConnection(), getHostelConnection()].filter(Boolean);

    await Promise.allSettled(connections.map((connection) => connection.close()));
};

export const seedAuthDb = async () => {
    await seedAdmins();
    await seedStudents();
};

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
    (async () => {
        try {
            await seedAuthDb();
            console.log("AuthDB dummy data seeded successfully.");
        } catch (error) {
            console.error("Seeding failed", error);
            process.exitCode = 1;
        } finally {
            await closeConnections();
        }
    })();
}
