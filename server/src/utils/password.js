import bcrypt from "bcryptjs";

export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, 10);
export const verifyPassword = (plainPassword, storedHash) =>
    bcrypt.compare(plainPassword, storedHash);
