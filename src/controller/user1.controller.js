import { User } from '../models/users.models';
import { ApiError } from '../utills/ApiError';
import { ApiResponse } from '../utills/ApiResponse';
import { asyncHandler } from '../utills/AsyncHandler';

const regsterUser1 = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => !field)) {
    throw new ApiError(400, 'All Fields are required!!');
  }

  const existingUser1 = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser1) {
    throw new ApiError(409, 'User already Existss!!');
  }

  const newUser = await User.create({
    fullName,
    username,
    ema,
    password,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, 'User created successfully', newUser));
});

export { regsterUser1 };
