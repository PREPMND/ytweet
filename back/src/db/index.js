import mongoose from "mongoose";
import env from "../env.js";

export const MongoConnection = async () => {
    try {
        // NOTE: the database name is passed via the `dbName` option, NOT by
        // string-concatenating it onto the URI. The old code appended it
        // after the query string (".../?ssl=true&...&appName=Cluster0/NAME"),
        // which the driver ignored.
        const instance = await mongoose.connect(env.MONGODB_URL, {
            dbName: env.DB_NAME,
            serverSelectionTimeoutMS: 30000,
        });

        console.log(
            `[mongo] connected -> host=${instance.connection.host} db=${instance.connection.name}`
        );

        return instance;
    } catch (error) {
        console.error("[mongo] connection failed:", error.message);
        process.exit(1);
    }
};

export const MongoDisconnect = async () => {
    await mongoose.connection.close().catch(() => {});
};
