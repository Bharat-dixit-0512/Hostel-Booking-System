import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";

import {
    GENDERS,
    RESIDENCE_TYPES,
    STUDENT_YEARS,
} from "../constants.js";
import {
    connectDatabases,
    getAuthConnection,
    getAuthStudentModel,
    getHostelConnection,
} from "../db/index.js";

const STUDENT_PASSWORD = "student123";

const closeConnections = async () => {
    const connections = [getAuthConnection(), getHostelConnection()].filter(Boolean);

    await Promise.allSettled(connections.map((connection) => connection.close()));
};

export const seedStudents = async () => {
    await connectDatabases();

    const Student = getAuthStudentModel();

    await Student.deleteMany({});

    const hashedPassword = await bcrypt.hash(STUDENT_PASSWORD, 10);
    const students = [];

    for (let i = 1; i <= 500; i += 1) {
        students.push({
            roll_number: 1000 + i,
            name: `Student${i}`,
            email: `student${i}@gla.ac.in`,
            password: hashedPassword,
            year: STUDENT_YEARS[(i - 1) % STUDENT_YEARS.length],
            gender: Math.random() > 0.5 ? GENDERS[0] : GENDERS[1],
            residence: i <= 350 ? RESIDENCE_TYPES.HOSTLER : RESIDENCE_TYPES.DAYSCHOLAR,
        });
    }

    await Student.insertMany(students);

    console.log("500 students inserted successfully");
    console.log(`Student login password: ${STUDENT_PASSWORD}`);
};

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
    (async () => {
        try {
            await seedStudents();
        } catch (error) {
            console.error("Seeding failed", error);
            process.exitCode = 1;
        } finally {
            await closeConnections();
        }
    })();
}
