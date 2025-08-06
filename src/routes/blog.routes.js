import { Router } from 'express';
import { createBlog, getAllBlogs } from '../controller/blog.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

router.route('/create').post(verifyJWT, createBlog);
router.route('/get-blogs').get(verifyJWT, getAllBlogs);

export default router;
