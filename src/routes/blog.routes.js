import { Router } from 'express';
import { createBlog } from '../controller/blog.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

router.route('/create').post(verifyJWT, createBlog);

export default router;
