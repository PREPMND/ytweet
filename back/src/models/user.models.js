import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,//cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    // Saved-for-later list. Stored on the user rather than as its own
    // collection because it is small, always read with the user, and never
    // queried from the other direction ("who saved this video?").
    watchLater: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    // Videos the user asked not to see again; filtered out of the feed.
    notInterested: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is Required"]
    },
    refreshToken: {
        type: String
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true });
/*
  Hash the password on save.

  In Mongoose 9 an ASYNC pre-hook receives NO `next` callback -- the returned
  promise is the completion signal. Resolving means "continue", throwing means
  "abort the save and surface this error". So `return` is correct here, and
  adding `next()` would throw "next is not a function".

  (In Mongoose 5/6 a *non-async* hook still takes `next`. Don't mix the two.)

  `isModified` matters: without it, every `user.save()` -- including the one
  that only stores a new refresh token -- would re-hash the already-hashed
  password and lock the account out.
*/
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECURITY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECURITY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};
export const User = model("User", userSchema);