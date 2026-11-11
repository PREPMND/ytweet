/**
 * Creates (or resets) a demo account for local testing.
 *
 *   node script/seed-test-user.js
 *
 * It writes straight to MongoDB so it does NOT need Cloudinary -- the avatar
 * is just a URL string, and the User schema only requires a string there.
 * The password goes through the model's pre("save") hook, so it is hashed
 * exactly the same way a real registration would hash it.
 */
import "../src/env.js";

import mongoose from "mongoose";
import { MongoConnection } from "../src/db/index.js";
import { User } from "../src/models/user.models.js";

const USERNAME = "demouser";
const EMAIL = "demo@socialsphere.test";
const PASSWORD = "demo1234";

await MongoConnection();

const existing = await User.findOne({ username: USERNAME });

if (existing) {
    // Assign + save (not findByIdAndUpdate) so the hashing hook runs.
    existing.password = PASSWORD;
    existing.fullName = "Demo User";
    await existing.save();
    console.log(`Reset password for existing user "${USERNAME}"`);
} else {
    await User.create({
        username: USERNAME,
        email: EMAIL,
        fullName: "Demo User",
        password: PASSWORD,
        avatar: "https://api.dicebear.com/9.x/thumbs/png?seed=demouser",
        coverImage: "",
    });
    console.log(`Created user "${USERNAME}"`);
}

console.log("\n  username: " + USERNAME);
console.log("  email:    " + EMAIL);
console.log("  password: " + PASSWORD + "\n");

await mongoose.connection.close();
process.exit(0);
