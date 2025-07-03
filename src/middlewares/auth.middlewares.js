import { User } from '../models/users.models.js';
import { ApiError } from '../utills/ApiError.js';
import { asyncHandler } from '../utills/AsyncHandler.js';
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'User is unauthorized!!');
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodeToken) {
      throw new ApiError(401, 'Invalid Access!!');
    }

    const user = await User.findById(decodeToken?._id).select(
      '-password -refreshToken',
    );

    req.user = user;
    next();
  } catch (error) {
    // console.log(`Error found in middlewares ${error}`);
    throw new ApiError(400, error);
  }
});

export { verifyJWT };
