import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;

    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Field is required");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        password,
        userName,
        email,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user.");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully."));
});

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
          }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        if (!username && !email) {
            return next(new ApiError(400, "User name or email is required"));
        }

        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (username) {
            user = await User.findOne({ username });
        }

        if (!user) {
            return next(new ApiError(404, "User doesn't exist"));
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ message: 'Account locked. Try again later.' });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {

            user.failedLoginAttempts += 1;

            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 24 * 60 * 60 * 1000;
            }

            await user.save();

            return next(new ApiError(401, "Invalid user credentials"));
        }

        user.failedLoginAttempts = 0;

        user.lockUntil = undefined;

        await user.save();

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
            user._id
        );

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "User logged In Successfully"
                )
            );
    } catch (error) {
        return next(
            new ApiError(500, "Something went wrong while logging in user")
        );
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const option = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, {}, "User logged out"));
});

export {
    registerUser,
    loginUser,
    logoutUser
}