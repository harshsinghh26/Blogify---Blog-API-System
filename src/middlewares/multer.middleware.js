import multer from 'multer';
import { ApiError } from '../utills/ApiError.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const allowdType = ['image/png', 'image/jpeg'];

    if (!allowdType.includes(file.mimetype)) {
      return cb(new ApiError(401, 'unsupported Format!!'));
    }

    return cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    return cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
