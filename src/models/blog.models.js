import mongoose, { Schema } from 'mongoose';

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImage: {
      type: String,
    },
    coverImageId: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Blog = mongoose.model('Blog', blogSchema);
