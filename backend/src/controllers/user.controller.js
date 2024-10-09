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
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

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

        const user = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (!user) {
            return next(new ApiError(404, "User doesn't exist"));
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return next(new ApiError(401, "Invalid user credentials"));
        }

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

export {
    registerUser,
    loginUser
}