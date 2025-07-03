import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {
  chanegAvatar,
  changePassword,
  changeUseDetail,
  deleteUser,
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
} from '../controller/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/change-password').patch(verifyJWT, changePassword);
router.route('/refresh').post(verifyJWT, refreshTokens);
router.route('/update').put(verifyJWT, changeUseDetail);
router
  .route('/update-avatar')
  .patch(upload.single('avatar'), verifyJWT, chanegAvatar);
router.route('/delete').delete(verifyJWT, deleteUser);

export default router;
