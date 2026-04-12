import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";

import { ADMIN_ROLES } from "../constants.js";
import {
    connectDatabases,
    getAuthAdminModel,
    getAuthConnection,
    getHostelConnection,
} from "../db/index.js";

const ADMIN_PASSWORD = "admin123";

const closeConnections = async () => {
    const connections = [getAuthConnection(), getHostelConnection()].filter(Boolean);

    await Promise.allSettled(connections.map((connection) => connection.close()));
};

export const seedAdmins = async () => {
    await connectDatabases();

    const Admin = getAuthAdminModel();

    await Admin.deleteMany({});

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admins = [];

    for (let i = 1; i <= 10; i += 1) {
        admins.push({
            employee_id: 100 + i,
            name: i === 1 ? "Main Admin" : `Sub Admin ${i - 1}`,
            email: i === 1 ? "mainadmin@gla.ac.in" : `subadmin${i - 1}@gla.ac.in`,
            password: hashedPassword,
            role: i === 1 ? ADMIN_ROLES.MAINADMIN : ADMIN_ROLES.SUBADMIN,
        });
    }

    await Admin.insertMany(admins);

    console.log("10 admins inserted successfully");
    console.log(`Admin login password: ${ADMIN_PASSWORD}`);
};

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
    (async () => {
        try {
            await seedAdmins();
        } catch (error) {
            console.error("Seeding failed", error);
            process.exitCode = 1;
        } finally {
            await closeConnections();
        }
    })();
}
