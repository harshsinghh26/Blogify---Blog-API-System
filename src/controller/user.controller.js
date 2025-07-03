import { User } from '../models/users.models.js';
import { uploadOnCloudinary } from '../utills/Cloudinary.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import { ApiError } from '../utills/ApiError.js';
import { asyncHandler } from '../utills/AsyncHandler.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Generate Token

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log('Something went Wrong: ', error);
  }
};

// Register User

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const avatarFilePath = req.files?.avatar[0]?.path;

  const avatar = await uploadOnCloudinary(avatarFilePath);

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    avatar: avatar?.url,
    avatarId: avatar?.public_id,
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User Registered Successfully!!'));
});

// Login User

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, 'All fields Required!!');
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, 'User not Found!!');
  }

  const checkpass = await user.isPasswordCorrect(password);

  if (!checkpass) {
    throw new ApiError(401, 'Unauthorize Access!!');
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, refreshToken, accessToken },
        'User Logged In Successfully!!',
      ),
    );
});

// Logout User

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('refreshToken', options)
    .clearCookie('accessToken', options)
    .json(new ApiResponse(200, {}, 'User Logged Out Successfully!!'));
});

// change password

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, 'Unauthorize Access!!');
  }
  const isPassword = await user.isPasswordCorrect(oldPassword);

  if (!isPassword) {
    throw new ApiError(401, 'Wrong Password!!');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password Changed Successfully!!'));
});

// refershToken

const refreshTokens = asyncHandler(async (req, res) => {
  const incomingTokens = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingTokens) {
    throw new ApiError(
      401,
      'User is not authorized or Login session Expired!!!',
    );
  }

  const decodeToken = jwt.verify(
    incomingTokens,
    process.env.REFRESH_TOKEN_SECRET,
  );

  if (!decodeToken) {
    throw new ApiError(401, 'Invailid Tokens!!');
  }

  const user = await User.findById(decodeToken._id);

  if (!user) {
    throw new ApiError(404, 'User not Found!!');
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user._id,
  );

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        'Tokens Refreshed Successfullt!!',
      ),
    );
});

// change user details

const changeUseDetail = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;

  if (!(fullName || email || username)) {
    throw new ApiError(400, 'Please enter some value!!');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
        username,
      },
    },
    { new: true },
  );

  const updatedUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, 'User Details updated Successfully!!'),
    );
});

// change UserAvatar

const chanegAvatar = asyncHandler(async (req, res) => {
  const userId = await User.findById(req.user._id);
  const avatarFilePath = req.file?.path;

  const avatar = await cloudinary.uploader.upload(avatarFilePath, {
    public_id: userId.avatarId,
    overwrite: true,
  });

  fs.unlinkSync(avatarFilePath);

  if (!avatar?.url) {
    throw new ApiError(500, 'Something went wrong while uploading avatart!!');
  }

  const user = await User.findByIdAndUpdate(
    userId._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'User Avatar Updated Successfully!!'));
});

// delete User

const deleteUser = asyncHandler(async (req, res) => {
  const userId = await User.findById(req.user._id);
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'Password is required!!');
  }

  const checkpass = await userId.isPasswordCorrect(password);

  if (!checkpass) {
    throw new ApiError(401, 'Wrong Password!!');
  }

  await cloudinary.uploader.destroy(userId?.avatarId);
  await User.findByIdAndDelete(userId._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'User deleted Succesfully!!'));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  refreshTokens,
  changeUseDetail,
  chanegAvatar,
  deleteUser,
};
