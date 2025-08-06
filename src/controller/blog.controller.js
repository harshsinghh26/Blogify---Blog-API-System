import { Blog } from '../models/blog.models.js';
import { uploadOnCloudinary } from '../utills/Cloudinary.js';
import { ApiResponse } from '../utills/ApiResponse.js';
import { ApiError } from '../utills/ApiError.js';
import { asyncHandler } from '../utills/AsyncHandler.js';

// Create Blog
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, tags, isPublished } = req.body;
  const author = req.user?._id;

  if (!title || !content) {
    throw new ApiError(400, 'Title and content are required');
  }

  const existingBlog = await Blog.findOne({
    $or: [{ title }, { author }],
  });

  if (existingBlog) {
    throw new ApiError(400, 'Blog already exists');
  }

  // let coverImage, coverImageId;
  // if (req.file?.path) {
  //   const upload = await uploadOnCloudinary(req.file.path);
  //   coverImage = upload?.url;
  //   coverImageId = upload?.public_id;
  // }

  const blog = await Blog.create({
    title,
    content,
    author,
    tags,
    isPublished,
    // coverImage,
    // coverImageId,
    publishedAt: isPublished ? new Date() : undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, blog, 'Blog created successfully'));
});

// Get All Blogs
export const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().populate('author', 'fullName username');
  return res
    .status(200)
    .json(new ApiResponse(200, blogs, 'All blogs fetched successfully'));
});

// Get Blog By ID
export const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate(
    'author',
    'fullName username avatar',
  );
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, blog, 'Blog fetched successfully'));
});

// Update Blog
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, isPublished } = req.body;
  let updateData = { title, content, tags, isPublished };

  if (isPublished) {
    updateData.publishedAt = new Date();
  }

  if (req.file?.path) {
    const upload = await uploadOnCloudinary(req.file.path);
    updateData.coverImage = upload?.url;
    updateData.coverImageId = upload?.public_id;
  }

  const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, blog, 'Blog updated successfully'));
});

// Delete Blog
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Blog deleted successfully'));
});
