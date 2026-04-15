import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: true })

        return { accessToken, refreshToken }
    } catch {
        throw new apiError(500, "Something went wrong while generating tokens")
    }
}
const registerUser = asyncHandler(async (req, res, next) => {
    //Get user data from frontend
    //Validation
    //check if user already exists,by username or email
    //check for images & avatar
    //upload them to cloudinary,avatar
    //created user object , in mongodb an object is called as nosql
    //remove password and refresh token field from response
    //check for user creation 
    //retru res
    console.log("yes")
    //getting user response
    const { fullName, email, username, password } = req.body
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath)
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar File Is Required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new apiError(400, "Avatar cannot be uploaded")
    }

    //entering the database
    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })
    //if user empty?
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new apiError(500, "smth went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User Registered Succesfully")
    )
})
const loginUser = asyncHandler(async (req, res, next) => {
    //req body
    //check if any field value is empty
    //check if user exists,find the user
    //password check
    //access and refresh token generation
    //send cookies ,secure cookies
    //successfull 
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new apiError(400, "Username or Email is required")
    }//User.findOne({username}) and await as data in diff continent
    const user = await User.findOne({ $or: [{ email }, { username }] })
    if (!user) {
        throw new apiError(404, "User Not Found , you may register")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    //these tokens are not present in local user
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser
                },
                "User Logged In Successfully"
            )
        )
})
const logOutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(200, {}, "User Logged Out Succesfully")
})
const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECURITY
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new apiError(401, "Invalid RefreshToken")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newrefreshToken)
            .json(
                new apiResponse(
                    200,
                    {},
                    "access token refreshed"
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Refresh Token")
    }
})
const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    /*{const {password,newpassword}=req.body
    if (!password) {throw new apiError(404,"Password Nout Found")}
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized Request")
    }
    try {
        const decodedToken=jwt.verify(
                incomingRefreshToken,process.env.REFRESH_TOKEN_SECURITY
            )
        const user=await User.findById(decodedToken?._id)
        if(!user){throw new apiError(401,"Invalid Refresh Token")}
        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid){
            throw new apiError(401,"Invalid Password")
        }
        user.password=await bcrypt.hash(newpassword, 10);
        await user.save();
        return res.status(200).json(new apiResponse(
            200,{},"Password Updated Succesfully"
        ))
    } catch (error) {
        throw new apiError(401,"Unauthorized Request")
    }}*/
    const { oldPassword, newPassword } = req.body
    const user = User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    //await before isPasswordCorrect because its a async function
    if (!isPasswordValid) {
        throw new apiError(401, "Wrong Password")
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });//didnt use bcrypt hash as already a middle ware .pre that will run befpre save and hash the password also that is a sync await 
    return res.status(200).json(new apiResponse(200, {}, "Password Updated Succesfully"))
})
const getCurrentUser = asyncHandler(async (req, res, next) => {
    console.log(">>> getCurrentUser called");

    const currentUser = await User.findById(req.user?._id)//an object
    console.log("currentUser")
    const payload = new apiResponse(200, currentUser, "Yes");
    console.log("Sending payload:", payload);
    res.status(200).json({
        statusCode: 200,
        data: req.user,
        message: "Yes",
        success: true
    });
})
const updateAccountDetails = asyncHandler(async (req, res, next) => {
    //file changes should be handled seperately in other ocntrollers
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new apiError(400, "All Fields Are Required")
    }
    //findbyidandupdate returns the updated values so gets stored in user
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {//set recieves an object
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { user },
                "Account Details Updated Succesfully"
            )
        )
})
const updateUserAvatar = asyncHandler(async (req, res, next) => {
    const avatarLocalPath = req.files?.path;
    //req.file got from multer not files as one file only
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar File Is Required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new apiError(400, "Avatar File Wasnt Able To Upload")
    }
    //todo delete old image
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {//set recieves an object
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res
        .status(200)
        .json(new apiResponse(
            200, { user }, "Avatar Updated Succesfully"
        ))
})
const updateUserCoverImage = asyncHandler(async (req, res, next) => {
    const CoverImageLocalPath = req.files?.path;
    //req.file got from multer not files as one file only
    if (!CoverImageLocalPath) {
        throw new apiError(400, "Cover Image File Is Required File Is Required")
    }
    const CoverImage = await uploadOnCloudinary(CoverImageLocalPath)
    if (!CoverImage.url) {
        throw new apiError(400, "CoverImage File Wasnt Able To Upload")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {//set recieves an object
            $set: {
                coverImage: CoverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")
    return res
        .status(200)
        .json(new apiResponse(
            200, { user }, "Cover Image Updated Succesfully"
        ))
})
const getUserChannelProfile = asyncHandler(async (req, res, next) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new apiError(404, "User Name is missing")
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",//as Subscription in db will be subscription
                localField: "subcribers_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "subscribed_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                subscribredToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }

            }
        },
        {
            $project: {
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                subscribredToCount: 1,
                username: 1,
                isSubscribed: 1
            }
        }
    ])
    if (!channel.length) {
        throw new apiError(404, "channel does not exist")
    }
    return res
        .status(200)
        .json(new apiResponse(
            200,
            channel[0],
            "Channel details found succesfully"
        ))
})
const getWatchHistory = asyncHandler(async (req, res, next) => {
    //nested lookup
    //learn about mongodb id as mngoose gives
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchhistory",
                pipeline: {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    avatar: 1,
                                    avatar: 1
                                }
                            },
                            {
                                $addFields: {
                                    owner: {
                                        $first: "$owner"//owner will get overwrite
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    ])
    return res
        .status(200)
        .json(
            new apiResponse(
                200, user[0].watchhistory, "Watch History Given"
            )
        )

})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}